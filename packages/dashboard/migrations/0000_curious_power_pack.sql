CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_user_id_provider_id_account_id_unique` ON `accounts` (`user_id`,`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`first_visit_at` text NOT NULL,
	`last_visit_at` text NOT NULL,
	`visit_count` integer DEFAULT 1,
	`browser` text,
	`browser_version` text,
	`os` text,
	`os_version` text,
	`device` text,
	`screen` text,
	`country` text,
	`country_name` text,
	`region` text,
	`city` text,
	`language` text,
	`timezone` text,
	`total_pageviews` integer DEFAULT 0,
	`total_events` integer DEFAULT 0,
	`total_engagement_time` integer DEFAULT 0,
	`identified_user_id` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `custom_event_registry` (
	`site_id` text NOT NULL,
	`event_name` text NOT NULL,
	`first_seen_at` text,
	`last_seen_at` text,
	`total_count_24h` integer DEFAULT 0,
	`total_count_7d` integer DEFAULT 0,
	`total_count_30d` integer DEFAULT 0,
	PRIMARY KEY(`site_id`, `event_name`),
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` text NOT NULL,
	`session_id` text NOT NULL,
	`visit_id` text NOT NULL,
	`event_type` integer NOT NULL,
	`url_path` text NOT NULL,
	`url_query` text,
	`url_hash` text,
	`referrer_domain` text,
	`referrer_path` text,
	`page_title` text,
	`event_name` text,
	`event_data` text,
	`browser` text,
	`browser_version` text,
	`os` text,
	`os_version` text,
	`device` text,
	`screen` text,
	`country` text,
	`region` text,
	`city` text,
	`language` text,
	`timezone` text,
	`engagement_time` integer,
	`campaign_bucket` text,
	`created_at` text,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'session',
	`steps` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `hourly_stats` (
	`site_id` text NOT NULL,
	`hour` text NOT NULL,
	`views` integer DEFAULT 0,
	`visits` integer DEFAULT 0,
	`visitors` integer DEFAULT 0,
	`bounce_count` integer DEFAULT 0,
	`total_duration` integer DEFAULT 0,
	`custom_events` integer DEFAULT 0,
	PRIMARY KEY(`site_id`, `hour`),
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions_auth` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_auth_token_unique` ON `sessions_auth` (`token`);--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`domain` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`plan` text DEFAULT 'free',
	`plan_status` text DEFAULT 'active',
	`settings` text DEFAULT '{}',
	`domain_key` text,
	`verification_token` text,
	`verified_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sites_domain_key_unique` ON `sites` (`domain_key`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_subscription_id` text NOT NULL,
	`provider_customer_id` text,
	`plan_id` text,
	`plan_name` text,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` integer,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false,
	`metadata` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false,
	`name` text,
	`image` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verifications_identifier_value_unique` ON `verifications` (`identifier`,`value`);