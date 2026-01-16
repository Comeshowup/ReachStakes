-- AlterTable
ALTER TABLE `brand_profiles` MODIFY `company_size` ENUM('Startup', 'Small', 'Medium', 'Large', 'Enterprise', 'Mid-Market') NULL DEFAULT 'Startup';
