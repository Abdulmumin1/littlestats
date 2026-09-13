# Cloudflare Data Platform analytics migration plan

Status: implemented and deployed; D1 retained as the control plane.

Date reviewed: 2026-09-13

Implementation checkpoint (2026-09-13):

- Provisioned R2 bucket/catalog `littlestats-analytics-data` and structured
  stream `littlestats_events_v1` (`cbc09f827c5c473f82ff19c29a961e7f`).
- Added the v1 schema/transform contract, Worker Pipeline binding, stable event
  IDs, canonical site-key resolution, durable Pipeline outbox, backfill route,
  R2 SQL read implementation, D1/R2 shadow mode, and rollback flags.
- Added R2-backed dashboard, site-card, and billing queries while retaining D1
  as the active production control-plane path.
- Upgraded Wrangler to 4.131.1; dashboard typecheck, unit tests, Worker dry-run,
  frontend production build, and the initial production-safe deployment pass.
- Applied the D1 control-plane migration for `analytics_deletion_jobs`.
- Credential and cutover gate completed: created the dedicated R2 token, a
  Running Pipeline/sink, stored the query secret, backfilled 18,235 D1 events,
  verified the catalog snapshot (18,235-row backfill plus subsequent appends),
  and deployed `pipeline`/`r2` mode (Worker version
  `a6952c64-f2f4-4611-b957-b8bac30bfe88`).

## Decision

Move durable analytics ingestion, storage, and historical queries from D1 to Cloudflare's Data Platform:

```text
tracker
  -> analytics Worker
  -> per-site Durable Object (canonicalization, realtime state, durable outbox)
  -> Pipelines structured stream
  -> Pipelines SQL transform
  -> R2 Data Catalog / Apache Iceberg (`analytics.events_v1`)
  -> R2 SQL REST API
  -> existing authenticated LittleStats API responses
```

D1 remains the control-plane database for users, auth sessions, sites, subscriptions, saved funnel definitions, feedback, and other mutable product records. It stops storing raw events, analytics sessions, and hourly analytics after the migration has passed its rollback window.

The per-site Durable Object remains the hot path for the existing realtime WebSocket. It is not the long-term analytics source of truth. This is necessary because an R2 Data Catalog sink has a minimum 60-second roll interval, while the product promises realtime updates.

Workers Analytics Engine is not the primary store. It has three-month retention and may sample high-volume data. Those properties are reasonable for operational telemetry, but not for exact customer-facing event logs, funnels, deletion workflows, or long-lived analytics.

## Why the current SQL path is failing and why it should still be replaced

The immediate error has a direct cause: `DomainAnalyticsDO.ts` inserts 21 event columns for five rows in one D1 statement, producing 105 bound parameters. D1 permits at most 100 bound parameters per query. The current uncommitted change reduces the batch to four rows (84 parameters), which is a valid short-term repair and must be preserved.

That repair does not address the architectural problems:

- All dashboard reports query raw D1 `events`; the `hourly_stats` table is used mainly for usage reporting, not as the dashboard read model.
- The same D1 database serves auth, billing, site configuration, feedback, event ingestion, and analytical scans. D1 databases process queries one at a time and have a 10 GB per-database limit on paid plans.
- Tracking identifiers are inconsistent. The site creation API emits an embed using `domain_key`, while the ingest Durable Object later treats the route value as `sites.id`. Some UI paths use `sites.id`, so behavior depends on which installation snippet a customer copied.
- The site card calls `api.getEventsList(...)`, but the current frontend API class exposes `getEvents(...)`; a green contract baseline must catch this kind of existing client/server drift before storage results are compared.
- `event_properties` and `custom_event_registry` exist in schema/design but are not maintained consistently. Custom properties currently live only in `events.event_data` JSON.
- The code and migrations have schema drift, while `tracker.ts` and the Better Auth adapter already prevent a clean dashboard TypeScript check. Migration verification needs a trustworthy baseline before cutover.
- The events table's many secondary indexes amplify D1 write work, and raw analytical `COUNT(DISTINCT ...)`, funnel CTEs, and broad groupings compete with transactional requests.

## Scope and metric contract

The migration includes every current analytics consumer:

- Overview summary and comparison period
- Hour/day time series
- Pages, referrers, countries, devices, browsers, and OS breakdowns
- Event log, event counts, and event-name discovery
- Campaign and goal reports
- Session and user funnels
- Site-card `session_count` and `events_24h`
- Monthly billable-event usage and enforcement
- Realtime active visitors/current-hour WebSocket data
- Site deletion, account deletion, retention, export, and backfill behavior

The migration will preserve the external API shapes used by `packages/web/src/lib/api/analytics.ts`. A storage change must not force a simultaneous frontend rewrite.

Metric definitions will be locked in tests before porting queries:

- `views`: pageview events only.
- `visits`: distinct 30-minute `visit_id` values containing at least one pageview.
- `visitors`: distinct monthly-scoped `visitor_id` values containing at least one pageview. This preserves the current month-salted behavior while naming it accurately.
- `bounce`: a visit with exactly one pageview. Custom events do not turn a one-page visit into a non-bounce unless product requirements are deliberately changed later.
- `avgDuration`: sum of bounded page-exit engagement seconds divided by visits.
- `custom events`: events with `event_type = 'custom'`.
- `session funnel`: group by `visit_id`.
- `user funnel`: group by `COALESCE(identified_user_id, visitor_id)`. This corrects the current misleading behavior, where the “user” funnel groups by the current `session_id` column.
- All ranges are UTC half-open intervals: `event_time >= start AND event_time < end_exclusive`.

## Target data ownership

| Data | Authoritative store | Notes |
| --- | --- | --- |
| Users, auth, sites, subscriptions | D1 | Mutable transactional/control-plane data |
| Saved funnel definitions | D1 | Configuration, not measured analytics |
| Feedback records | D1 | Mutable workflow data; may reference analytics IDs |
| Raw analytics events | R2 Data Catalog Iceberg table | Durable analytical source of truth |
| Realtime active state | Per-site Durable Object | Rolling hot window only |
| Ingest retry queue | Per-site Durable Object storage | Temporary outbox, removed only after Pipeline acknowledgement |
| Account monthly quota counter | Per-account Durable Object | Atomic enforcement state, reconciled against Iceberg |
| Historical report results | R2 SQL | Optionally cached briefly after authorization |
| Pipeline health telemetry | Cloudflare Pipeline metrics | Ingested, written, decode errors, dropped records |

## Canonical event schema

Create one structured stream and one primary Iceberg table, versioned from the start as `analytics.events_v1`. Do not create one stream or table per customer: the beta account limit is 20 streams, sinks, and pipelines, and per-customer tables would not scale.

Required fields:

| Field | Type | Purpose |
| --- | --- | --- |
| `schema_version` | `int32` | Starts at `1`; stream schemas cannot be edited after creation |
| `event_id` | `string` | UUID generated once in the tracker and retained across retries |
| `site_id` | `string` | Canonical internal `sites.id`, never the public domain key |
| `event_time` | `timestamp` | Server receipt time in UTC for report semantics |
| `event_type` | `string` | `pageview`, `custom`, `page_exit`, or `identify` |
| `visitor_id` | `string` | Monthly-scoped pseudonymous visitor identity |
| `visit_id` | `string` | 30-minute inactivity visit identity |
| `url_path` | `string` | Normalized path |
| `is_billable` | `bool` | True only for pageviews and custom events under current plans |

Optional fields:

- `identified_user_id`, `page_title`, `url_query`, `url_hash`
- `referrer_domain`, `referrer_path`
- `event_name`, `event_properties` (`json`)
- `browser`, `browser_version`, `os`, `os_version`, `device`, `screen`
- `country`, `region`, `city`, `language`, `timezone`
- `engagement_seconds`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `campaign_bucket`

Do not store raw IP addresses. If the tracker has no first-party visitor ID, use the IP only transiently to derive the existing monthly-scoped hash, then discard it. Cap event names, URLs, identifiers, and JSON property size at ingest.

Pipelines automatically adds `__ingest_ts` and partitions its Iceberg table by day on that field. Normal dashboard queries must filter both `event_time` and a safe `__ingest_ts` envelope so R2 SQL can prune files. Backfilled rows should set `__ingest_ts` to their historical `event_time` when appended through an Iceberg client; this behavior must be proven in staging before production backfill.

Because a browser retry can submit the same logical event twice even when the Pipeline itself delivers exactly once, every report query will initially read through a canonical deduplication CTE keyed by `event_id`. After production evidence shows the Durable Object outbox prevents duplicates, simple count queries may omit that CTE only if a reconciliation test proves the results remain exact.

## Ingestion behavior

1. The tracking route accepts either `sites.id` or `domain_key`, resolves it through D1 once, and passes only canonical `sites.id` into the Durable Object and event record. Cache the mapping in the Durable Object after the first successful lookup.
2. The tracker adds a stable `event_id` before attempting delivery. Normal navigation uses acknowledged `fetch` with a small bounded retry queue; unload uses `sendBeacon` as best effort. Every retry reuses the same ID.
3. Validate the payload in the Worker before accepting it. Typed Pipeline bindings catch code/schema drift, but structured-stream schema mismatches can still be accepted and later dropped, so application validation is mandatory.
4. The per-site Durable Object updates realtime state and saves the canonical event to a durable outbox before acknowledging the tracker.
5. The outbox drain sends bounded arrays through the Worker Pipeline binding and removes records only after `send()` confirms ingestion.
6. If `send()` fails, retain the records and schedule an alarm with bounded exponential backoff. A send-accepted/outbox-delete failure may replay records, which is why `event_id` is stable.
7. Realtime aggregation uses a separate rolling in-memory/persisted window. Sending an event to Pipelines must not make it disappear from top-pages or active-visitor state.
8. During migration, a feature flag controls `d1`, `dual`, or `pipeline` write mode. Dual mode remains enabled until backfill and reconciliation gates pass.

## Query layer

Create an `AnalyticsRepository` interface and make the existing stats façade depend on it rather than directly on `D1Database`. Implement:

- `D1AnalyticsRepository` for rollback and comparison only.
- `R2SqlAnalyticsRepository` as the target.
- `ShadowAnalyticsRepository` to return D1 responses while comparing normalized R2 results asynchronously.

The R2 SQL client will call:

```text
POST https://api.sql.cloudflarestorage.com/api/v1/accounts/{ACCOUNT_ID}/r2-sql/query/{BUCKET_NAME}
```

The account ID, bucket name, and scoped API token stay in Worker variables/secrets; the browser never receives them. R2 SQL's public API currently accepts a SQL string rather than D1-style bound parameters, so the repository must use a tiny query compiler:

- Values go through one tested SQL-literal encoder.
- Table, column, ordering, dimension, and granularity identifiers come only from fixed allowlists.
- Funnel step count, report date span, event-name length, search length, and result limit are bounded.
- Never concatenate unchecked URL parameters into SQL.
- Retry only documented transient service failures, with one bounded retry and request timeout.

R2 SQL query rules:

- Select named columns, always include time filters, and cap results.
- Use the new `event_time,event_id` keyset for event-log pagination; R2 SQL has no `OFFSET` support.
- Preserve exact counts initially. For date ranges large enough to hit R2 SQL's budget gate, return an explicit error or use an explicitly labelled approximate mode; never silently change customer metrics.
- Port the funnel to one bounded CTE query instead of one network query per step.
- Remove the country join by using the denormalized event country.
- Query event names directly from custom events; remove `custom_event_registry` from the analytics path.
- Keep the existing REST response contracts, including zero-filled time buckets and country display-name mapping in application code.

Suggested caching after authorization:

- 30 seconds for a range that includes today.
- 5 minutes for closed historical ranges.
- No R2 SQL cache for the realtime endpoint.
- Cache keys include canonical site ID, normalized filter, query version, and authenticated access scope. Site/account deletion explicitly purges or versions out cached results.

## File-level implementation map

Existing files to change:

- `packages/dashboard/wrangler.jsonc`: add the Pipeline stream binding and R2 SQL configuration; keep D1 and Durable Object bindings.
- `packages/dashboard/src/types/env.ts`: add the generated Pipeline binding type and R2 SQL environment fields.
- `packages/dashboard/src/lib/tracker-script.ts`: generate stable event IDs and retry the same payload safely.
- `packages/dashboard/src/routes/tracking.ts`: resolve public domain keys to canonical site IDs before choosing a Durable Object.
- `packages/dashboard/src/durable-objects/DomainAnalyticsDO.ts`: replace D1 event/hourly flushes with a Pipeline outbox while preserving realtime state.
- `packages/dashboard/src/lib/dashboard-api.ts` and `src/lib/stats/*.ts`: depend on `AnalyticsRepository` and port report SQL.
- `packages/dashboard/src/routes/sites.ts`: stop D1 subqueries over analytics tables; request site-card counts from the analytics repository.
- `packages/dashboard/src/routes/billing.ts`: read the authoritative per-account quota Durable Object and display R2-reconciled usage.
- `packages/dashboard/src/db/schema.ts` and future migrations: keep legacy analytics tables during rollback; remove them only after the retention window.
- `packages/dashboard/package.json`: upgrade Wrangler from 3.114.x to a current supported 4.x release and add repeatable validation commands.
- `README.md`, `packages/dashboard/README.md`, and `docs/self-hosting.md`: document the new paid-plan/beta prerequisites and provisioning.

New implementation files/directories (names were adapted to the existing codebase):

- `packages/dashboard/src/lib/analytics/dashboard-api-factory.ts`
- `packages/dashboard/src/lib/analytics/r2-sql-client.ts`
- `packages/dashboard/src/lib/analytics/r2-dashboard-api.ts`
- `packages/dashboard/src/lib/analytics/r2-usage.ts`
- `packages/dashboard/src/lib/analytics/event-contract.ts`
- `packages/dashboard/src/routes/migrations.ts`
- `infra/data-platform/events-v1.schema.json`
- `infra/data-platform/pipeline-v1.sql`
- `infra/data-platform/README.md`
- `packages/dashboard/migrations/0004_add_analytics_deletion_jobs.sql`

Follow-up files still required at the credential/cutover gate:

- A privileged Iceberg deletion/retention runner.
- A repeatable reconciliation command for site/day/type parity.
- Staging integration fixtures for all report endpoints.

## Execution plan and gates

### Phase 0 — Freeze semantics and establish a green baseline

1. Preserve the user's existing four-row D1 batch fix.
2. Fix or isolate the current dashboard TypeScript failures so migration regressions are visible. At minimum, resolve the missing `DeviceInfo` import, the obsolete Better Auth adapter signatures, and the unused/broken `tracker.ts` compilation path.
3. Fix the existing site-card `getEventsList`/`getEvents` API mismatch, then add deterministic fixture data covering duplicate events, visits crossing midnight, one-page bounces, page exits, identify events, campaigns, null dimensions, and ordered/unordered funnel steps.
4. Capture golden JSON responses for every analytics endpoint.
5. Add `ANALYTICS_WRITE_MODE` and `ANALYTICS_READ_MODE`; deploy with `d1` first,
   then advance through `dual`/`shadow` to the current `pipeline`/`r2` mode.

Gate: baseline tests and typecheck pass, and metric definitions above are represented in fixtures.

### Phase 1 — Provision an isolated staging Data Platform

1. Upgrade Wrangler to current 4.x and regenerate Worker types.
2. Create a dedicated staging R2 bucket and enable R2 Data Catalog.
3. Enable automatic compaction and snapshot expiration for staging.
4. Create the versioned structured event stream from `events-v1.schema.json`.
5. Create an R2 Data Catalog sink with Zstandard Parquet compression and a 60-second roll interval.
6. Create the pass-through/normalization Pipeline and bind the stream ID to the staging Worker using the current `stream` binding field.
7. Create separate least-privilege tokens for the sink and R2 SQL query service; do not reuse an admin token in application code.

Gate: a synthetic event sent through the Worker appears exactly once in `analytics.events_v1`, schema validation errors are zero, and R2 SQL can query it through the REST API.

### Phase 2 — Implement stable ingestion and dual-write

1. Normalize site keys at the tracking edge.
2. Add stable tracker `event_id` values and server validation.
3. Implement the Durable Object outbox and Pipeline drain.
4. Keep the existing D1 flush as the second destination in `dual` mode.
5. Add the per-account monthly usage Durable Object and reconcile it without putting raw analytics back into D1.
6. Separate realtime rolling state from the persistence outbox.

Gate: a fault-injection test covering Worker-accepted events, Worker restart, Durable Object restart, Pipeline timeout, and replay produces no missing canonical event IDs; duplicates are visible and deduplicated in reports. Browser requests that never reach Cloudflare remain best-effort analytics delivery.

### Phase 3 — Port and contract-test all reads

1. Implement the R2 SQL client, literal encoder, allowlists, timeouts, and error mapping.
2. Port core summary and time series first.
3. Port breakdowns and the event log.
4. Port campaigns/goals and then funnels.
5. Port site-card counts and billing usage/reconciliation.
6. Run each repository against the same fixture and compare normalized API responses.

Gate: every current endpoint has an exact contract test; R2 SQL `EXPLAIN FORMAT JSON` confirms time/file pruning for each query family; no query uses unchecked interpolation or `SELECT *`.

### Phase 4 — Backfill D1 history

1. Turn on dual-write and record the UTC cutover watermark.
2. Drain all pre-deployment Durable Object outboxes.
3. Export D1 events in keyset batches joined to legacy sessions where needed to recover visitor and identified-user fields.
4. Transform timestamps, event types, campaign fields, properties, and stable event IDs into the v1 contract.
5. Append historical records to the Pipeline-created Iceberg table using a documented Iceberg client and historical `__ingest_ts = event_time`, if the staging proof passes.
6. If writing historical `__ingest_ts` to that table is rejected, use a separate `events_legacy_v1` Iceberg table partitioned by event date and have the repository `UNION ALL` it with the live table. Do not put all history into today's live ingest partition.
7. Reconcile counts and checksums by site/day/type, plus sampled event IDs and all golden report outputs.

Gate: zero unexplained count differences for closed periods; all differences in the open freshness window resolve after the sink interval; deletion is tested on copied staging data.

### Phase 5 — Shadow, canary, and cut over reads

1. Enable `shadow` reads for internal/admin traffic and log only normalized metric differences, never raw event properties.
2. Canary R2 reads for one internal site, then 5%, 25%, and 100% of sites.
3. At every step, observe query latency, R2 bytes scanned, Pipeline freshness, dropped records, and D1/R2 diffs for at least one full traffic cycle.
4. Change the default read mode to R2 only after all gates hold.

Gate: for seven days, closed-period metrics match exactly, freshness is under two minutes at p95, uncached dashboard queries meet the agreed latency SLO, and error/dropped-event alerts remain below threshold.

### Phase 6 — Stop D1 analytics writes and retire legacy tables

1. Switch write mode from `dual` to `pipeline` while keeping the D1 reader available.
2. Retain D1 analytics tables read-only for 30 days as rollback data.
3. Run daily R2-to-D1 reconciliation during that window.
4. After sign-off and a D1 Time Travel/export backup, remove raw-event/session/hourly writes and then drop legacy analytics tables in a separate, explicitly approved migration.
5. Update self-hosting docs and provisioning automation.

Gate: rollback window closes with no unresolved discrepancies and a tested R2 export/restore procedure.

### Phase 7 — Retention and deletion operations

Recommended initial policy: 90 days for raw events and 25 months for compact daily aggregates. Funnels and raw event logs are therefore limited to the raw retention window; longer-lived charts use aggregate tables.

R2 SQL is read-only, and snapshot expiration alone does not delete rows still referenced by the current Iceberg snapshot. Implement retention and GDPR/site deletion as catalog transactions through PySpark or another supported Iceberg writer, then allow snapshot expiration to remove unreferenced files. Never delete Iceberg objects directly from the R2 bucket.

Before enabling production retention:

1. Add a daily aggregate stream/table and a scheduled rollup job for closed UTC days.
2. Store rollup provenance (`query_version`, source date, generated time) and make rollup writes replay-safe.
3. Add a deletion queue for site/account/visitor requests.
4. Verify deletes through R2 SQL, expire snapshots after the recovery window, and record completion without storing deleted identifiers in logs.
5. Make site deletion asynchronous in the API until Iceberg deletion completes; do not report success after deleting only the D1 site row.

## Observability and acceptance criteria

Required dashboards/alerts:

- Pipeline records/bytes in versus records/bytes written.
- Decode errors and dropped events by `missing_field`, `type_mismatch`, `parse_failure`, and `null_value`.
- Oldest outbox record and outbox depth per site.
- End-to-end freshness: maximum `event_time` visible in R2 SQL versus current time.
- R2 SQL status, latency, retries, files scanned, and bytes scanned by query family.
- D1-versus-R2 shadow differences by metric and site, without raw payloads.
- Duplicate `event_id` rate.
- Monthly quota counter versus R2 reconciliation.
- Compaction and snapshot-expiration health.

Initial acceptance targets (to validate, not assume):

- No missing event IDs in fault-injection tests.
- Zero structured-stream dropped records.
- Closed-period report parity: exact.
- Open-period parity: converges after the Pipeline freshness window.
- R2 visibility freshness: p95 under two minutes; alert at five minutes.
- Realtime WebSocket freshness: under five seconds and independent of R2 availability.
- Cached report p95 under 250 ms; uncached report p95 target under three seconds.
- No Cloudflare catalog/query token in browser bundles, responses, or logs.
- A site deletion removes the site from queries immediately and completes physical cleanup within the documented internal deletion SLO.

## Rollback

Rollback is controlled by the two independent feature flags:

- Read regression: set `ANALYTICS_READ_MODE=d1`; keep Pipeline writes enabled.
- Pipeline ingestion regression: set `ANALYTICS_WRITE_MODE=d1`; retain failed events in the Durable Object outbox while repairing the Pipeline.
- R2 SQL outage: serve an explicit temporarily unavailable response for historical reports or the short authorized cache; realtime continues from the Durable Object. Do not silently serve stale values as current.
- Bad schema: create `events_v2` resources and dual-write/compare. Streams and sinks are not assumed mutable.
- Bad backfill: roll queries back to D1, delete only the isolated copied table/catalog transaction after exact target verification, and rerun from the watermark.

Do not remove D1 analytics data or its read repository until the 30-day rollback window has completed.

## Risks that remain explicit

1. Pipelines, R2 Data Catalog, and R2 SQL are beta products. The staged rollout and D1 rollback path are mandatory.
2. R2 SQL queries have a 10 MB minimum billed scan and exact distinct/window-heavy queries may be budget-gated or time out on large ranges. Time pruning, compaction, caching, bounded funnels, and explicit approximate mode are the mitigations.
3. Structured stream schemas cannot be modified, and sink configuration cannot be modified in place. Version resource names and rehearse `v1 -> v2` dual-write.
4. Iceberg row deletion needs a write-capable engine; R2 SQL cannot perform it. Retention is incomplete until the deletion runner exists and is tested.
5. The query API token requires broad R2-related permissions in current Cloudflare guidance. Scope it to the analytics bucket/account resources, store it only as a Worker secret, and rotate it.
6. The current product privacy claim is stronger than the implementation: identify calls and custom JSON may contain PII. Add documented payload limits and a data-classification policy before long retention.
7. Wrangler was upgraded from 3.x to 4.131.1 and passed typecheck, tests, a
   Worker dry-run, and a production-safe deployment with both analytics modes
   still set to `d1`.

## Review record

### Review 1 — Repository coverage

Checked all analytics routes, stats modules, the tracking route and generated tracker, Durable Object persistence, site-card counts, billing usage, D1 schema/migrations, frontend API contracts, and self-hosting docs. Added site-card, billing, realtime, deletion, and saved-funnel ownership explicitly so “all analytics” does not mean only the overview screen.

### Review 2 — Cloudflare product fit

Checked current Cloudflare documentation for Pipelines ingestion and typed bindings, stream/sink immutability, beta limits, Iceberg sink roll latency, R2 SQL REST access and supported SQL, pagination constraints, query pricing, Data Catalog maintenance, and row deletion. This review caused three plan changes: retain Durable Objects for realtime; version schemas/resources from day one; and require a write-capable Iceberg deletion runner.

### Review 3 — Correctness and migration safety

Rechecked identifiers, event retry behavior, UTC range edges, deduplication, late/backfilled events, bounce/duration definitions, campaign/funnel groupings, and cutover watermarks. This review added canonical site-key resolution, tracker-generated stable event IDs, historical `__ingest_ts` handling with a fallback legacy table, and independent read/write rollback flags.

### Review 4 — Operations, security, privacy, and cost

Rechecked secrets, query injection, beta failure modes, dropped structured events, compaction, retention, site deletion, D1 rollback, and R2 SQL billing. This review added the allowlisted query compiler, authorized result caching, Pipeline error metrics, exact-versus-approximate policy, physical deletion verification, and a 30-day D1 rollback window.

## Primary Cloudflare references

- [Cloudflare Data Platform announcement](https://blog.cloudflare.com/cloudflare-data-platform/)
- [Cloudflare Pipelines overview](https://developers.cloudflare.com/pipelines/)
- [Writing to Pipeline streams from Workers](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/)
- [Pipeline stream schemas](https://developers.cloudflare.com/pipelines/streams/manage-streams/)
- [Pipeline limits](https://developers.cloudflare.com/pipelines/platform/limits/)
- [Pipeline pricing](https://developers.cloudflare.com/pipelines/platform/pricing/)
- [Pipeline metrics and dropped-event errors](https://developers.cloudflare.com/pipelines/observability/metrics/)
- [R2 Data Catalog sink behavior](https://developers.cloudflare.com/pipelines/sinks/available-sinks/r2-data-catalog/)
- [R2 Data Catalog overview](https://developers.cloudflare.com/r2-data-catalog/)
- [R2 Data Catalog maintenance](https://developers.cloudflare.com/r2-data-catalog/table-maintenance/)
- [Deleting Iceberg data safely](https://developers.cloudflare.com/r2-data-catalog/deleting-data/)
- [R2 SQL overview](https://developers.cloudflare.com/r2-sql/)
- [R2 SQL REST query API](https://developers.cloudflare.com/r2-sql/query-data/)
- [R2 SQL supported SQL](https://developers.cloudflare.com/r2-sql/sql-reference/)
- [R2 SQL limitations and best practices](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)
- [R2 SQL troubleshooting and keyset pagination](https://developers.cloudflare.com/r2-sql/troubleshooting/)
- [R2 SQL pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)
- [Workers Analytics Engine limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
