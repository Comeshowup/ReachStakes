-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `role` ENUM('brand', 'creator', 'admin') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand_profiles` (
    `user_id` INTEGER NOT NULL,
    `company_name` VARCHAR(100) NOT NULL,
    `tagline` VARCHAR(255) NULL,
    `industry` VARCHAR(50) NULL,
    `location` VARCHAR(100) NULL,
    `about` TEXT NULL,
    `logo_url` LONGTEXT NULL,
    `banner_url` LONGTEXT NULL,
    `company_size` ENUM('Startup', 'Mid-Market', 'Enterprise') NULL DEFAULT 'Startup',
    `hiring_status` ENUM('Active', 'Hiring', 'Paused') NULL DEFAULT 'Active',
    `hiring_since` INTEGER NULL,
    `website_url` VARCHAR(255) NULL,
    `social_links` JSON NULL,
    `contact_email` VARCHAR(255) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_profiles` (
    `user_id` INTEGER NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `handle` VARCHAR(50) NOT NULL,
    `tagline` VARCHAR(255) NULL,
    `avatar_url` LONGTEXT NULL,
    `primary_platform` ENUM('Instagram', 'TikTok', 'YouTube', 'Twitch', 'Twitter', 'Other') NULL,
    `location` VARCHAR(100) NULL,
    `about` TEXT NULL,
    `niche_tags` JSON NULL,
    `followers_count` INTEGER NULL DEFAULT 0,
    `engagement_rate` DECIMAL(5, 2) NULL,
    `base_price` DECIMAL(10, 2) NULL,
    `social_links` JSON NULL,
    `rating` DECIMAL(3, 2) NULL DEFAULT 5.00,
    `brand_affiliations` JSON NULL,
    `media_kit_enabled` BOOLEAN NOT NULL DEFAULT true,
    `media_kit_slug` VARCHAR(50) NULL,
    `stats_last_updated` DATETIME(3) NULL,
    `verification_tier` ENUM('None', 'Silver', 'Gold', 'Black') NULL DEFAULT 'None',
    `reliability_score` INTEGER NULL DEFAULT 0,
    `completed_campaigns` INTEGER NOT NULL DEFAULT 0,
    `on_time_delivery_rate` DECIMAL(5, 2) NULL,
    `brand_safety_score` INTEGER NULL DEFAULT 100,
    `tazapay_beneficiary_id` VARCHAR(100) NULL,
    `tazapay_entity_id` VARCHAR(100) NULL,
    `onboarding_status` ENUM('NotStarted', 'LinkGenerated', 'InProgress', 'PendingApproval', 'Approved', 'Rejected') NULL DEFAULT 'NotStarted',
    `onboarding_link_url` VARCHAR(500) NULL,
    `onboarding_expires_at` DATETIME(3) NULL,
    `payout_status` ENUM('Inactive', 'Pending', 'Active', 'Suspended') NULL DEFAULT 'Inactive',
    `bank_country` VARCHAR(5) NULL,
    `bank_currency` VARCHAR(5) NULL,
    `bank_name` VARCHAR(100) NULL,
    `bank_last_four` VARCHAR(4) NULL,
    `banking_setup_at` DATETIME(3) NULL,

    UNIQUE INDEX `creator_profiles_media_kit_slug_key`(`media_kit_slug`),
    INDEX `creator_profiles_handle_idx`(`handle`),
    INDEX `idx_niche`(`user_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_demographics` (
    `creator_id` INTEGER NOT NULL,
    `age_ranges` JSON NULL,
    `gender_split` JSON NULL,
    `top_countries` JSON NULL,

    PRIMARY KEY (`creator_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `turnaround_time` VARCHAR(50) NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,

    INDEX `creator_services_creator_id_idx`(`creator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `platform_required` VARCHAR(50) NULL,
    `campaign_type` VARCHAR(50) NULL,
    `status` ENUM('Draft', 'Active', 'Completed', 'Paused') NULL DEFAULT 'Draft',
    `target_budget` DECIMAL(10, 2) NULL,
    `deadline` DATE NULL,
    `usage_rights` VARCHAR(100) NULL,
    `usage_category` VARCHAR(100) NULL,
    `exclusivity` VARCHAR(100) NULL,
    `exclusivity_period` INTEGER NULL,
    `is_whitelisting_required` BOOLEAN NOT NULL DEFAULT false,
    `content_usage_scope` VARCHAR(255) NULL,
    `escrow_balance` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_funded` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_released` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `escrow_status` ENUM('Locked', 'Released', 'Refunded') NULL DEFAULT 'Locked',
    `payout_speed` ENUM('Instant', 'Standard') NULL DEFAULT 'Standard',
    `escrow_funded_at` DATETIME(3) NULL,
    `is_guaranteed_pay` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `campaigns_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_collaborations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `creator_id` INTEGER NOT NULL,
    `status` ENUM('Applied', 'Invited', 'In Progress', 'Under Review', 'Revision', 'Approved', 'Paid') NULL DEFAULT 'Applied',
    `agreed_price` DECIMAL(10, 2) NULL,
    `deliverables` JSON NULL,
    `deliverable_version` INTEGER NULL DEFAULT 1,
    `submission_url` VARCHAR(255) NULL,
    `submission_title` VARCHAR(255) NULL,
    `submission_platform` VARCHAR(50) NULL,
    `submission_notes` TEXT NULL,
    `milestones` JSON NULL,
    `is_whitelisted` BOOLEAN NOT NULL DEFAULT false,
    `whitelisting_status` ENUM('Requested', 'Active', 'Revoked', 'None') NULL DEFAULT 'None',
    `usage_agreed` VARCHAR(100) NULL,
    `rights_expiration_date` DATE NULL,
    `video_id` VARCHAR(100) NULL,
    `video_stats` JSON NULL,
    `views_count` BIGINT NULL DEFAULT 0,
    `likes_count` INTEGER NULL DEFAULT 0,
    `shares_count` INTEGER NULL DEFAULT 0,
    `engagement_rate` DECIMAL(5, 2) NULL,
    `is_insured` BOOLEAN NOT NULL DEFAULT false,
    `payout_released` BOOLEAN NOT NULL DEFAULT false,
    `payout_date` DATETIME(3) NULL,
    `performance_metrics` JSON NULL,
    `estimated_emv` DECIMAL(10, 2) NULL,
    `feedback_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `campaign_id` INTEGER NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `type` ENUM('Deposit', 'Payment', 'Withdrawal', 'Refund') NOT NULL,
    `status` ENUM('Pending', 'Completed', 'Failed') NULL DEFAULT 'Pending',
    `description` VARCHAR(255) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tazapay_reference_id` VARCHAR(100) NULL,
    `checkout_url` VARCHAR(500) NULL,
    `gateway_status` VARCHAR(50) NULL,
    `processed_at` DATETIME(3) NULL,
    `platform_fee` DECIMAL(10, 2) NULL,
    `processing_fee` DECIMAL(10, 2) NULL,
    `net_amount` DECIMAL(10, 2) NULL,
    `received_amount` DECIMAL(10, 2) NULL,
    `received_currency` VARCHAR(10) NULL,
    `metadata` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand_id` INTEGER NOT NULL,
    `campaign_id` INTEGER NULL,
    `record_date` DATE NOT NULL,
    `revenue_generated` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `spend_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `impressions` INTEGER NULL DEFAULT 0,
    `clicks` INTEGER NULL DEFAULT 0,

    INDEX `analytics_daily_brand_id_record_date_idx`(`brand_id`, `record_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('Casting Call', 'Showcase', 'General') NOT NULL,
    `content_text` TEXT NULL,
    `media_url` VARCHAR(255) NULL,
    `media_type` ENUM('image', 'video', 'none') NULL DEFAULT 'none',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `platform` ENUM('Instagram', 'TikTok', 'YouTube', 'Twitch', 'Twitter', 'Other') NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `handle` VARCHAR(100) NULL,
    `provider_account_id` VARCHAR(191) NULL,
    `profile_url` VARCHAR(255) NULL,
    `access_token` TEXT NULL,
    `refresh_token` TEXT NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `social_accounts_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `collaboration_id` INTEGER NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `brand_name` VARCHAR(100) NOT NULL,
    `campaign_title` VARCHAR(255) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Draft', 'Sent', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Draft',
    `issued_at` DATETIME(3) NULL,
    `paid_at` DATETIME(3) NULL,
    `tax_year` INTEGER NOT NULL,
    `pdf_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_creator_id_tax_year_idx`(`creator_id`, `tax_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collaboration_id` INTEGER NOT NULL,
    `author_id` INTEGER NOT NULL,
    `timestamp` DECIMAL(10, 2) NOT NULL,
    `feedbackText` TEXT NOT NULL,
    `feedbackType` VARCHAR(50) NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `collaboration_id` INTEGER NULL,
    `campaign_id` INTEGER NULL,
    `type` ENUM('Contract', 'W9', '1099-NEC', 'NDA', 'Media_Release', 'Tax_Form', 'Other') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('Draft', 'Pending_Signature', 'Signed', 'Expired', 'Voided') NOT NULL DEFAULT 'Draft',
    `file_url` VARCHAR(500) NULL,
    `signed_file_url` VARCHAR(500) NULL,
    `signature_id` VARCHAR(255) NULL,
    `signed_at` DATETIME(3) NULL,
    `signed_by_name` VARCHAR(100) NULL,
    `expires_at` DATETIME(3) NULL,
    `tax_year` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `documents_creator_id_idx`(`creator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NULL,
    `date` DATE NOT NULL,
    `time_slot` VARCHAR(50) NOT NULL,
    `agenda` TEXT NULL,
    `status` ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') NOT NULL DEFAULT 'Scheduled',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `meetings_email_idx`(`email`),
    INDEX `meetings_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_payouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `collaboration_id` INTEGER NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(5) NOT NULL DEFAULT 'USD',
    `status` ENUM('Pending', 'Processing', 'Completed', 'Failed') NOT NULL DEFAULT 'Pending',
    `tazapay_payout_id` VARCHAR(100) NULL,
    `payout_type` VARCHAR(20) NULL,
    `failure_reason` VARCHAR(255) NULL,
    `initiated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `creator_payouts_creator_id_status_idx`(`creator_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brand_profiles` ADD CONSTRAINT `brand_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_profiles` ADD CONSTRAINT `creator_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_demographics` ADD CONSTRAINT `creator_demographics_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_services` ADD CONSTRAINT `creator_services_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_collaborations` ADD CONSTRAINT `campaign_collaborations_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_collaborations` ADD CONSTRAINT `campaign_collaborations_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_daily` ADD CONSTRAINT `analytics_daily_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_daily` ADD CONSTRAINT `analytics_daily_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_posts` ADD CONSTRAINT `community_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_accounts` ADD CONSTRAINT `social_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_collaboration_id_fkey` FOREIGN KEY (`collaboration_id`) REFERENCES `campaign_collaborations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_feedback` ADD CONSTRAINT `content_feedback_collaboration_id_fkey` FOREIGN KEY (`collaboration_id`) REFERENCES `campaign_collaborations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_feedback` ADD CONSTRAINT `content_feedback_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_payouts` ADD CONSTRAINT `creator_payouts_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
