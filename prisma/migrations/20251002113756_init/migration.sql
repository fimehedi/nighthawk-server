/*
  Warnings:

  - Added the required column `back_link` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paragraph_one` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paragraph_three` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paragraph_two` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Blog` ADD COLUMN `back_link` VARCHAR(191) NOT NULL,
    ADD COLUMN `paragraph_one` LONGTEXT NOT NULL,
    ADD COLUMN `paragraph_three` LONGTEXT NOT NULL,
    ADD COLUMN `paragraph_two` LONGTEXT NOT NULL,
    MODIFY `short_description` LONGTEXT NOT NULL;
