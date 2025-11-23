import { prisma } from '../../db/prisma.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';
import chunkUploadHelper from '../../utils/chunkUploadHelper.mjs';

/**
 * Convert BigInt values to strings for JSON serialization
 */
function convertBigIntToString(obj) {
	if (obj === null || obj === undefined) return obj;
	if (typeof obj === 'bigint') return obj.toString();
	if (Array.isArray(obj)) return obj.map(convertBigIntToString);
	if (typeof obj === 'object') {
		const converted = {};
		for (const key in obj) {
			converted[key] = convertBigIntToString(obj[key]);
		}
		return converted;
	}
	return obj;
}

class AssetService {
	/**
	 * Initialize a new upload session for an existing asset
	 */
	async initializeUpload(payload) {
		const { assetId, totalChunks, totalSize, originalFilename } = payload;

		// Validate asset ID is provided
		if (!assetId) {
			throw new Error('Asset ID is required. Please create the asset first via POST /api/assets');
		}

		// Verify asset exists
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(assetId) }
		});

		if (!asset) {
			throw new Error(`Asset with ID ${assetId} does not exist`);
		}

		// Validate file type
		if (!chunkUploadHelper.isValidFileType(originalFilename)) {
			throw new Error('Invalid file type. Allowed types: .skp, .zip, .png, .jpeg, .jpg');
		}

		const finalAssetId = parseInt(assetId);

		// Generate upload session ID
		const uploadSessionId = chunkUploadHelper.generateSessionId();
		const fileType = chunkUploadHelper.getFileExtension(originalFilename);

		// Create AssetFile record to track the upload
		await prisma.assetFile.upsert({
			where: { asset_id: finalAssetId },
			update: {
				upload_session_id: uploadSessionId,
				upload_status: 'pending',
				upload_progress: 0,
				uploaded_chunks: 0,
				total_chunks: parseInt(totalChunks),
				file_type: fileType,
				file_size: BigInt(totalSize)
			},
			create: {
				asset_id: finalAssetId,
				upload_session_id: uploadSessionId,
				upload_status: 'pending',
				upload_progress: 0,
				uploaded_chunks: 0,
				total_chunks: parseInt(totalChunks),
				file_type: fileType,
				file_size: BigInt(totalSize),
				main_file: ''
			}
		});

		return {
			assetId: finalAssetId,
			uploadSessionId,
			fileType,
			totalChunks: parseInt(totalChunks),
			totalSize: parseInt(totalSize),
			message: 'Upload session initialized'
		};
	}

	/**
	 * Upload a single chunk
	 */
	async uploadChunk(payload) {
		const { uploadSessionId, chunkIndex, chunkData } = payload;

		// Check if chunk already exists (for resume functionality)
		const chunkExists = await chunkUploadHelper.chunkExists(uploadSessionId, parseInt(chunkIndex));
		if (chunkExists) {
			return {
				message: 'Chunk already uploaded',
				chunkIndex: parseInt(chunkIndex)
			};
		}

		// Save the chunk
		await chunkUploadHelper.saveChunk(uploadSessionId, parseInt(chunkIndex), chunkData);

		return {
			message: 'Chunk uploaded successfully',
			chunkIndex: parseInt(chunkIndex)
		};
	}

	/**
	 * Complete the upload by merging all chunks
	 */
	async completeUpload(payload) {
		const { uploadSessionId, assetId, totalChunks, originalFilename } = payload;

		console.log('completeUpload payload:', { uploadSessionId, assetId, totalChunks, originalFilename });

		let finalAssetId = assetId;
		let totalChunksInt = parseInt(totalChunks) || 0;

		// If assetId not provided, try to find it from existing AssetFile with same uploadSessionId
		if (!assetId || totalChunksInt === 0) {
			const existingFile = await prisma.assetFile.findUnique({
				where: { upload_session_id: uploadSessionId }
			});
			
			if (existingFile) {
				finalAssetId = existingFile.asset_id;
				// Use totalChunks from AssetFile if not provided
				if (totalChunksInt === 0) {
					totalChunksInt = existingFile.total_chunks;
				}
			} else {
				throw new Error('Asset ID is required or upload session not found');
			}
		}

		// Verify asset exists
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(finalAssetId) }
		});

		if (!asset) {
			throw new Error(`Asset with ID ${finalAssetId} does not exist`);
		}

		console.log('totalChunksInt:', totalChunksInt, 'type:', typeof totalChunksInt);
		
		const mergedFile = await chunkUploadHelper.mergeChunks(
			uploadSessionId,
			totalChunksInt,
			originalFilename
		);

		const fileType = chunkUploadHelper.getFileExtension(originalFilename);
		const fileSizeInt = parseInt(mergedFile.size || 0) || 0;
		const assetIdInt = parseInt(finalAssetId);

		// Create or update AssetFile record
		const assetFile = await prisma.assetFile.upsert({
			where: { asset_id: assetIdInt },
			update: {
				main_file: mergedFile.relativePath,
				file_type: fileType,
				file_size: BigInt(fileSizeInt),
				upload_status: 'completed',
				upload_progress: 100,
				uploaded_chunks: totalChunksInt,
				total_chunks: totalChunksInt,
				upload_session_id: uploadSessionId
			},
			create: {
				main_file: mergedFile.relativePath,
				file_type: fileType,
				file_size: BigInt(fileSizeInt),
				upload_status: 'completed',
				upload_progress: 100,
				uploaded_chunks: totalChunksInt,
				total_chunks: totalChunksInt,
				upload_session_id: uploadSessionId,
				asset: {
					connect: { id: assetIdInt }
				}
			}
		});

		// Convert BigInt to string for JSON serialization
		const fileResponse = {
			...assetFile,
			file_size: assetFile.file_size.toString()
		};

		return {
			message: 'File upload completed successfully',
			file: fileResponse
		};
	}

	/**
	 * Get upload status
	 */
	async getUploadStatus(uploadSessionId) {
		// Get list of uploaded chunks
		const uploadedChunksList = await chunkUploadHelper.getUploadedChunks(uploadSessionId);

		return {
			uploadSessionId,
			uploadedChunksList,
			message: 'Upload status retrieved'
		};
	}

	/**
	 * Update asset preview image
	 */
	async updatePreviewImage(id, payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		const asset = await prisma.asset.update({
			where: { id: parseInt(id) },
			data: {
				cover: images.cover || payload.cover
			}
		});

		return asset;
	}

	/**
	 * Cancel upload
	 */
	async cancelUpload(uploadSessionId) {
		// Clean up chunks
		await chunkUploadHelper.cleanupSession(uploadSessionId);

		return { message: 'Upload cancelled successfully' };
	}

	async createAsset(payload) {
		console.log('payload', payload);

		const cover = {};
		const images = [];
		const uploadSessionIds = [];

		// Extract upload session IDs from payload
		Object.keys(payload).forEach((key) => {
			if (key.startsWith('uploadSessionIds[')) {
				uploadSessionIds.push(payload[key]);
				delete payload[key];
			}
		});

		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				if (file.fieldname === 'cover') {
					cover[file.fieldname] = file.filename;
				} else {
					images.push({
						image: file.filename,
					});
				}
			});
		}

		delete payload.files;

		// create asset
		const asset = await prisma.asset.create({
			data: {
				...payload,
				...cover,
				sub_category_id: parseInt(payload.sub_category_id),
			},
		});

		// create asset images
		const assetImages = images.map((image) => ({
			image: image.image,
			asset_id: asset.id,
		}));

		console.log('assetImages', assetImages);

		if (assetImages.length > 0) {
			await prisma.assetImage.createMany({
				data: assetImages,
			});
		}

		// Link uploaded files to the asset
		if (uploadSessionIds.length > 0) {
			console.log('Linking upload sessions to asset:', uploadSessionIds);
			for (const uploadSessionId of uploadSessionIds) {
				await prisma.assetFile.update({
					where: { upload_session_id: uploadSessionId },
					data: { asset_id: asset.id }
				});
			}
		}

		// Return asset with file info
		return await prisma.asset.findUnique({
			where: { id: asset.id },
			include: {
				sub_category: true,
				images: true,
				file: true,
			}
		});
	}

	async updateAsset(id, payload) {
		console.log('payload', payload);
		const cover = {};
		const images = [];
		const uploadSessionIds = [];

		// Extract upload session IDs from payload
		Object.keys(payload).forEach((key) => {
			if (key.startsWith('uploadSessionIds[')) {
				uploadSessionIds.push(payload[key]);
				delete payload[key];
			}
		});

		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				if (file.fieldname === 'cover') {
					cover[file.fieldname] = file.filename;
				} else {
					images.push({
						image: file.filename,
					});
				}
			});
		}

		const assetId = parseInt(id);

		await prisma.asset.update({
			where: {
				id: assetId,
			},
			data: {
				name: payload.name,
				resolution: payload.resolution,
				size: payload.size,
				download_link: payload.download_link,
				short_description: payload.short_description,
				sub_category_id: parseInt(payload.sub_category_id),
				meta_title: payload.meta_title,
				meta_description: payload.meta_description,
				...cover,
			},
		});

		const assetImages = images.map((image) => ({
			image: image.image,
			asset_id: assetId,
		}));

		if (assetImages.length > 0) {
			await prisma.assetImage.createMany({
				data: assetImages,
			});
		}

		// Link uploaded files to the asset
		if (uploadSessionIds.length > 0) {
			console.log('Linking upload sessions to asset:', uploadSessionIds);
			for (const uploadSessionId of uploadSessionIds) {
				await prisma.assetFile.update({
					where: { upload_session_id: uploadSessionId },
					data: { asset_id: assetId }
				});
			}
		}

		// Return updated asset with file info
		return await prisma.asset.findUnique({
			where: { id: assetId },
			include: {
				sub_category: true,
				images: true,
				file: true,
			}
		});
	}

	async getAssets() {
		// const assets = await Asset.find().populate('sub_category');
		const assets = await prisma.asset.findMany({
			include: {
				sub_category: true,
				images: true,
				file: true,
			},
			orderBy: {
				id: 'desc',
			},
		});
		return convertBigIntToString(assets);
	}

	async getAssetsByPagination({ page = 1, limit = 10, order = 'desc' }) {
		// const assetsPromise = Asset.find()
		// 	.sort({ createdAt: order === 'asc' ? 1 : -1 })
		// 	.skip((page - 1) * limit)
		// 	.limit(limit);

		const assetsPromise = prisma.asset.findMany({
			include: {
				sub_category: true,
				images: true,
				file: true,
			},
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				id: order === 'asc' ? 'asc' : 'desc',
			},
		});

		// const countPromise = Asset.countDocuments();
		const countPromise = prisma.asset.count();

		const [assets, total] = await Promise.all([assetsPromise, countPromise]);

		const totalPage = Math.ceil(total / limit);
		const currentPage = page;

		return {
			result: convertBigIntToString(assets),
			pagination: {
				total,
				totalPage,
				currentPage,
			},
		};
	}

	async getAsset(id) {
		// const asset = await Asset.findById(id).populate('sub_category');
		const asset = await prisma.asset.findUnique({
			where: {
				id: parseInt(id),
			},
			include: {
				sub_category: true,
				images: true,
				file: true,
			},
		});
		return convertBigIntToString(asset);
	}

	async deleteAsset(id) {
		await prisma.asset.delete({
			where: {
				id: parseInt(id),
			},
		});
	}

	/**
	 * Download asset file
	 */
	async downloadAsset(id) {
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(id) },
			include: { file: true }
		});

		if (!asset) {
			throw new Error('Asset not found');
		}

		if (!asset.file || !asset.file.main_file) {
			throw new Error('No file available for download');
		}

		// Construct full file path
		const filePath = `uploads/${asset.file.main_file}`;
		
		return filePath;
	}
}

export default new AssetService();
