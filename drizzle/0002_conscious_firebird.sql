CREATE TABLE `applicationStageEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`fromStatus` enum('none','applied','screening','interview','offered','accepted','rejected','withdrawn') NOT NULL DEFAULT 'none',
	`toStatus` enum('applied','screening','interview','offered','accepted','rejected','withdrawn') NOT NULL,
	`note` text,
	`actorUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicationStageEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digestRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`savedSearchId` int NOT NULL,
	`userId` int NOT NULL,
	`frequency` enum('daily','weekly') NOT NULL,
	`windowStart` timestamp NOT NULL,
	`windowEnd` timestamp NOT NULL,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`jobsSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `digestRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digestSent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`digestRunId` int NOT NULL,
	`jobId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `digestSent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailSendLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queueId` int,
	`recipientUserId` int,
	`recipientEmail` varchar(320),
	`subject` varchar(255),
	`outcome` enum('sent','skipped_no_email','transport_error','logged_only') NOT NULL,
	`providerResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailSendLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`text` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` enum('in_app','email') NOT NULL,
	`eventType` varchar(60) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobKey` varchar(255) NOT NULL,
	`channel` enum('in_app','email') NOT NULL,
	`recipientUserId` int NOT NULL,
	`eventType` varchar(60) NOT NULL,
	`subject` varchar(255),
	`payload` json NOT NULL,
	`status` enum('pending','processing','sent','failed','dead') NOT NULL DEFAULT 'pending',
	`retryCount` int NOT NULL DEFAULT 0,
	`backoffUntil` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationQueue_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationQueue_jobKey_unique` UNIQUE(`jobKey`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(60) NOT NULL,
	`payload` json,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profileViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerUserId` int NOT NULL,
	`profileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profileViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetType` enum('job','profile') NOT NULL,
	`targetId` int NOT NULL,
	`reporterUserId` int NOT NULL,
	`reason` varchar(500) NOT NULL,
	`status` enum('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`query` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unsubscribeTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` enum('in_app','email') NOT NULL,
	`token` varchar(128) NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `unsubscribeTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `unsubscribeTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `locations` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `locations` ADD `longitude` decimal(10,7);