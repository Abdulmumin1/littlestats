# LittleStats Cloudflare Data Platform

This directory is the versioned contract for the analytics data plane.

- Stream: `littlestats_events_v1`
- R2 bucket/catalog: `littlestats-analytics-data`
- Iceberg namespace/table: `analytics.events_v1`
- Worker binding: `ANALYTICS_STREAM`

Provisioned in Cloudflare account `fa97301bcfdd3061f1dce2adc8289535`:

- Catalog bucket: `littlestats-analytics-data` (Western Europe)
- Stream ID: `cbc09f827c5c473f82ff19c29a961e7f`
- Sink ID: `5d7e0ce9b4784cabb4971f5e05ed0447`
- Pipeline ID: `1abb8e718df04aa6908d8f42c5a7422a`

The sink and pipeline require a dedicated R2 Admin Read & Write token. After
creating that token, provision them with:

```sh
wrangler pipelines sinks create littlestats_events_v1_sink \
  --type r2-data-catalog \
  --bucket littlestats-analytics-data \
  --namespace analytics \
  --table events_v1 \
  --compression zstd \
  --roll-interval 60 \
  --roll-size 100 \
  --catalog-token "$WRANGLER_R2_SQL_AUTH_TOKEN"

wrangler pipelines create littlestats_events_v1_pipeline \
  --sql-file ../../infra/data-platform/pipeline-v1.sql
```

The stream schema is immutable. Any incompatible change must create `events-v2`
rather than editing a provisioned v1 stream.

Runtime rollout modes:

- `ANALYTICS_WRITE_MODE=d1` — rollback mode; only D1 receives events.
- `ANALYTICS_WRITE_MODE=dual` — D1 and Pipelines receive events.
- `ANALYTICS_WRITE_MODE=pipeline` — Pipelines is the only historical event sink.
- `ANALYTICS_READ_MODE=d1|shadow|r2` — historical dashboard read source (`r2`
  is the current production mode).

Never commit the R2 SQL/catalog token. Store it as `R2_SQL_API_TOKEN` with
`wrangler secret put`.

Historical D1 events can be copied in cursor batches through the protected
`POST /internal/migrations/analytics/backfill` endpoint. Configure the temporary
`MIGRATION_ADMIN_TOKEN` secret before using it, and remove that secret after the
reconciliation gate passes. Replaying a batch is safe because R2 reads dedupe on
the stable `event_id`.

Site deletion first writes a row to the D1 `analytics_deletion_jobs`
control-plane table. A privileged maintenance process must apply the matching
Iceberg row deletion and then mark that job `completed`.
