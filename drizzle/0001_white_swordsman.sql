CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`profileId` int NOT NULL,
	`status` enum('applied','screening','interview','offered','accepted','rejected','withdrawn') NOT NULL DEFAULT 'applied',
	`coverNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidateProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`headline` varchar(160),
	`summary` text,
	`currentTitle` varchar(120),
	`yearsOfExperience` smallint,
	`locationId` int,
	`remotePolicy` enum('onsite','hybrid','remote','flexible'),
	`desiredSalaryMin` decimal(12,2),
	`desiredSalaryMax` decimal(12,2),
	`resumeUrl` varchar(512),
	`resumeFileName` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidateProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidateProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `candidateSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`skillId` int NOT NULL,
	`proficiency` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`years` smallint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `candidateSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`industry` varchar(100),
	`website` varchar(320),
	`size` enum('1-10','11-50','51-200','201-1000','1000+'),
	`locationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `companyMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`role` enum('owner','member') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `companyMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `education` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`institution` varchar(200) NOT NULL,
	`degree` varchar(160) NOT NULL,
	`fieldOfStudy` varchar(160),
	`startYear` smallint,
	`endYear` smallint,
	CONSTRAINT `education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`skillId` int NOT NULL,
	`weight` enum('required','preferred') NOT NULL,
	CONSTRAINT `jobSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`seniority` enum('junior','mid','senior','lead','staff') NOT NULL,
	`employmentType` enum('full-time','part-time','contract','internship') NOT NULL DEFAULT 'full-time',
	`salaryMin` decimal(12,2),
	`salaryMax` decimal(12,2),
	`locationId` int,
	`remotePolicy` enum('onsite','hybrid','remote','flexible') NOT NULL,
	`published` boolean NOT NULL DEFAULT false,
	`applicationCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(100),
	`region` varchar(100),
	`country` varchar(80) NOT NULL,
	`displayName` varchar(200) NOT NULL,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profileDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStep` smallint NOT NULL DEFAULT 0,
	`stepData` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profileDrafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `profileDrafts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `resumeSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`kind` enum('workExperience','education','skill') NOT NULL,
	`status` enum('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resumeSuggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skillAliases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alias` varchar(100) NOT NULL,
	`skillId` int NOT NULL,
	CONSTRAINT `skillAliases_id` PRIMARY KEY(`id`),
	CONSTRAINT `skillAliases_alias_unique` UNIQUE(`alias`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`category` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_id` PRIMARY KEY(`id`),
	CONSTRAINT `skills_name_unique` UNIQUE(`name`),
	CONSTRAINT `skills_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `workExperiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`company` varchar(160) NOT NULL,
	`startDate` date,
	`endDate` date,
	`current` boolean NOT NULL DEFAULT false,
	`description` text,
	CONSTRAINT `workExperiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('candidate','employer','both') DEFAULT 'candidate' NOT NULL;