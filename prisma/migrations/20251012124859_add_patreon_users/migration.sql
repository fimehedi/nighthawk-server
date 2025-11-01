-- CreateTable
CREATE TABLE `PatreonUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patreon_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NULL,
    `access_token` TEXT NOT NULL,
    `refresh_token` TEXT NOT NULL,
    `token_expires_at` DATETIME(3) NOT NULL,
    `membership_tier` VARCHAR(191) NULL,
    `is_active_patron` BOOLEAN NOT NULL DEFAULT false,
    `pledge_amount_cents` INTEGER NULL,
    `last_verified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PatreonUser_patreon_id_key`(`patreon_id`),
    UNIQUE INDEX `PatreonUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
