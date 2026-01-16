-- AlterTable
ALTER TABLE `creator_profiles` ADD COLUMN `creator_onboarding_completed_at` DATETIME(3) NULL,
    ADD COLUMN `creator_onboarding_step` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `quick_win_tasks` JSON NULL;
