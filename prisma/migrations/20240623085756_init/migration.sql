-- AlterTable
ALTER TABLE `Asset` ADD COLUMN `download_link` VARCHAR(191) NULL,
    MODIFY `short_description` VARCHAR(191) NULL;
