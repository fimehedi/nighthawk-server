/*
  Warnings:

  - Added the required column `short_description` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Asset` ADD COLUMN `short_description` VARCHAR(191) NOT NULL;
