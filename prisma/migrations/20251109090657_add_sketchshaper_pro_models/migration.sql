-- CreateTable
CREATE TABLE `SketchShaperProCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `preview_image` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SketchShaperProFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `preview_image` VARCHAR(191) NOT NULL,
    `main_file` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `size_bytes` BIGINT NOT NULL,
    `upload_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `upload_progress` DOUBLE NOT NULL DEFAULT 0,
    `uploaded_chunks` INTEGER NOT NULL DEFAULT 0,
    `total_chunks` INTEGER NOT NULL DEFAULT 0,
    `chunk_size` INTEGER NOT NULL DEFAULT 5242880,
    `upload_session_id` VARCHAR(191) NULL,
    `sketchshaper_pro_category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SketchShaperProFile_upload_session_id_key`(`upload_session_id`),
    INDEX `SketchShaperProFile_upload_session_id_idx`(`upload_session_id`),
    INDEX `SketchShaperProFile_upload_status_idx`(`upload_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SketchShaperProFile` ADD CONSTRAINT `SketchShaperProFile_sketchshaper_pro_category_id_fkey` FOREIGN KEY (`sketchshaper_pro_category_id`) REFERENCES `SketchShaperProCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
