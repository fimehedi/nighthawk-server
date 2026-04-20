-- AlterTable
ALTER TABLE `AboutUs` MODIFY `short_description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Asset` MODIFY `short_description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Category` MODIFY `short_description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Slider` MODIFY `short_description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `SubCategory` MODIFY `short_description` LONGTEXT NOT NULL;
