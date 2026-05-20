ALTER TABLE `campaigns`
  ADD COLUMN `pricing_model` VARCHAR(50) NULL DEFAULT 'flat_fee',
  ADD COLUMN `budget_guardrail_min` DECIMAL(10, 2) NULL,
  ADD COLUMN `budget_guardrail_max` DECIMAL(10, 2) NULL,
  ADD COLUMN `target_cpm` DECIMAL(10, 2) NULL,
  ADD COLUMN `max_cpm` DECIMAL(10, 2) NULL,
  ADD COLUMN `max_creator_payout` DECIMAL(10, 2) NULL,
  ADD COLUMN `negotiation_instructions` TEXT NULL;

ALTER TABLE `campaign_collaborations`
  ADD COLUMN `proposed_price` DECIMAL(10, 2) NULL,
  ADD COLUMN `pricing_model` VARCHAR(50) NULL DEFAULT 'flat_fee',
  ADD COLUMN `estimated_views` INTEGER NULL,
  ADD COLUMN `calculated_cpm` DECIMAL(10, 2) NULL,
  ADD COLUMN `offer_terms` JSON NULL,
  ADD COLUMN `offer_expires_at` DATETIME(3) NULL,
  ADD COLUMN `offer_accepted_at` DATETIME(3) NULL;
