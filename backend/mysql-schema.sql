-- NearJob — Workers + Companies (separate tables), Jobs, Conversations, Messages.
-- Import in phpMyAdmin after creating an empty database.
-- MySQL 5.7+ (JSON). Drops existing tables if present.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Messages`;
DROP TABLE IF EXISTS `Conversations`;
DROP TABLE IF EXISTS `Jobs`;
DROP TABLE IF EXISTS `Workers`;
DROP TABLE IF EXISTS `Companies`;
-- Legacy single-table schema (if you used it before)
DROP TABLE IF EXISTS `Users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `Companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `latitude` FLOAT NULL,
  `longitude` FLOAT NULL,
  `companyName` VARCHAR(255) NULL,
  `industry` VARCHAR(255) NULL,
  `companySize` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `logo` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Workers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `latitude` FLOAT NULL,
  `longitude` FLOAT NULL,
  `fullName` VARCHAR(255) NULL,
  `role` VARCHAR(255) NULL,
  `experience` VARCHAR(255) NULL,
  `jobTitle` VARCHAR(255) NULL,
  `skills` JSON NULL,
  `avatar` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Jobs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `companyName` VARCHAR(255) NULL,
  `location` VARCHAR(255) NOT NULL,
  `salary` VARCHAR(255) NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'Full-time',
  `tags` JSON NULL,
  `logo` VARCHAR(255) NULL,
  `rating` FLOAT NULL DEFAULT 0,
  `applicants` INT NULL DEFAULT 0,
  `companyId` INT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_company_id` (`companyId`),
  CONSTRAINT `jobs_company_id_fk`
    FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Conversations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `workerId` INT NOT NULL,
  `companyId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_worker_company` (`workerId`, `companyId`),
  KEY `conversations_worker_id` (`workerId`),
  KEY `conversations_company_id` (`companyId`),
  CONSTRAINT `conversations_worker_id_fk`
    FOREIGN KEY (`workerId`) REFERENCES `Workers` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `conversations_company_id_fk`
    FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` TEXT NOT NULL,
  `conversationId` INT NULL,
  `senderWorkerId` INT NULL,
  `senderCompanyId` INT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_conversation_id` (`conversationId`),
  KEY `messages_sender_worker_id` (`senderWorkerId`),
  KEY `messages_sender_company_id` (`senderCompanyId`),
  CONSTRAINT `messages_conversation_id_fk`
    FOREIGN KEY (`conversationId`) REFERENCES `Conversations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `messages_sender_worker_id_fk`
    FOREIGN KEY (`senderWorkerId`) REFERENCES `Workers` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `messages_sender_company_id_fk`
    FOREIGN KEY (`senderCompanyId`) REFERENCES `Companies` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
