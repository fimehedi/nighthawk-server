-- CreateTable
CREATE TABLE `AssetFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` INTEGER NOT NULL,
    `main_file` VARCHAR(191) NOT NULL DEFAULT '',
    `file_type` VARCHAR(191) NOT NULL DEFAULT '',
    `file_size` BIGINT NOT NULL DEFAULT 0,
    `upload_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `upload_progress` DOUBLE NOT NULL DEFAULT 0,
    `uploaded_chunks` INTEGER NOT NULL DEFAULT 0,
    `total_chunks` INTEGER NOT NULL DEFAULT 0,
    `chunk_size` INTEGER NOT NULL DEFAULT 5242880,
    `upload_session_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AssetFile_asset_id_key`(`asset_id`),
    UNIQUE INDEX `AssetFile_upload_session_id_key`(`upload_session_id`),
    INDEX `AssetFile_upload_session_id_idx`(`upload_session_id`),
    INDEX `AssetFile_upload_status_idx`(`upload_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AssetFile` ADD CONSTRAINT `AssetFile_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `Asset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
