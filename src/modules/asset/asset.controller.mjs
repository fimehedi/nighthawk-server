import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import assetService from './asset.service.mjs';
import fs from 'fs';
import path from 'path';

class AssetController {
	/**
	 * Initialize upload session
	 * POST /api/assets/initialize
	 */
	initializeUpload = catchError(async (req, res, next) => {
		console.log('Initialize request body:', req.body);
		const result = await assetService.initializeUpload(req.body);
		console.log('Initialize result:', result);
		const resDoc = responseHandler(201, result.message, {
			uploadSessionId: result.uploadSessionId,
			fileId: result.assetId
		});
		res.status(201).json(resDoc);
	});

	/**
	 * Initialize upload session with asset ID in URL
	 * POST /api/assets/:id/initialize
	 */
	initializeUploadWithId = catchError(async (req, res, next) => {
		const { id } = req.params;
		console.log('Initialize request with ID:', id, 'Body:', req.body);
		const result = await assetService.initializeUpload({
			...req.body,
			assetId: id
		});
		console.log('Initialize result:', result);
		const resDoc = responseHandler(201, result.message, {
			uploadSessionId: result.uploadSessionId,
			fileId: result.assetId
		});
		res.status(201).json(resDoc);
	});

	/**
	 * Upload a chunk
	 * POST /api/assets/upload-chunk
	 */
	uploadChunk = catchError(async (req, res, next) => {
		const { uploadSessionId, chunkIndex } = req.body;
		
		if (!req.file) {
			return res.status(400).json({
				status: 'error',
				code: 400,
				message: 'No chunk file provided'
			});
		}

		const result = await assetService.uploadChunk({
			uploadSessionId,
			chunkIndex,
			chunkData: req.file.buffer
		});

		const resDoc = responseHandler(200, result.message, result);
		res.status(200).json(resDoc);
	});

	/**
	 * Complete upload (merge chunks)
	 * POST /api/assets/complete
	 */
	completeUpload = catchError(async (req, res, next) => {
		console.log('Complete upload request body:', req.body);
		const result = await assetService.completeUpload(req.body);
		const resDoc = responseHandler(200, result.message, result.file);
		res.status(200).json(resDoc);
	});

	/**
	 * Get upload status
	 * GET /api/assets/status/:uploadSessionId
	 */
	getUploadStatus = catchError(async (req, res, next) => {
		const { uploadSessionId } = req.params;
		const result = await assetService.getUploadStatus(uploadSessionId);
		const resDoc = responseHandler(200, "Upload status retrieved successfully", result);
		res.status(200).json(resDoc);
	});

	/**
	 * Cancel upload
	 * DELETE /api/assets/cancel/:uploadSessionId
	 */
	cancelUpload = catchError(async (req, res, next) => {
		const { uploadSessionId } = req.params;
		const result = await assetService.cancelUpload(uploadSessionId);
		const resDoc = responseHandler(200, result.message);
		res.status(200).json(resDoc);
	});

	/**
	 * Update preview image
	 * PUT /api/assets/:id/preview
	 */
	updatePreviewImage = catchError(async (req, res, next) => {
		const asset = await assetService.updatePreviewImage(req.params.id, {
			...req.body,
			files: req.files,
		});
		const resDoc = responseHandler(200, "Preview image updated successfully", asset);
		res.status(200).json(resDoc);
	});

	createAsset = catchError(async (req, res, next) => {
		const asset = await assetService.createAsset({
			...req.body,
			files: req.files,
		});
		const resDoc = responseHandler(201, 'Asset created successfully', asset);
		res.status(201).json(resDoc);
	});

	updateAsset = catchError(async (req, res, next) => {
		const { id } = req.params;
		
		// Validate that ID is numeric
		if (!/^\d+$/.test(id)) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'Asset not found',
			});
		}
		
		const {
			name,
			resolution,
			size,
			download_link,
			short_description,
			sub_category_id,
			meta_title,
			meta_description,
          
		} = req.body;

		const asset = await assetService.updateAsset(id, {
			name,
			resolution,
			size,
			download_link,
			short_description,
			sub_category_id,
			meta_title,
			meta_description,
			
			files: req.files,
		});
		const resDoc = responseHandler(200, 'Asset updated successfully', asset);
		res.status(200).json(resDoc);
	});

	getAssets = catchError(async (req, res, next) => {
		const assets = await assetService.getAssets();
		const resDoc = responseHandler(
			200,
			'Assets retrieved successfully',
			assets
		);
		res.status(200).json(resDoc);
	});

	getAssetsByPagination = catchError(async (req, res, next) => {
		const { page, limit, order } = req.query;
		const assets = await assetService.getAssetsByPagination({
			page: parseInt(page),
			limit: parseInt(limit),
			order,
		});
		const resDoc = responseHandler(
			200,
			'Assets retrieved successfully',
			assets
		);
		res.status(200).json(resDoc);
	});

	getAsset = catchError(async (req, res, next) => {
		const { id } = req.params;
		
		// Validate that ID is numeric
		if (!/^\d+$/.test(id)) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'Asset not found',
			});
		}
		
		const asset = await assetService.getAsset(id);
		
		if (!asset) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'Asset not found',
			});
		}
		
		const resDoc = responseHandler(200, 'Asset retrieved successfully', asset);
		res.status(200).json(resDoc);
	});

	deleteAsset = catchError(async (req, res, next) => {
		const { id } = req.params;
		
		// Validate that ID is numeric
		if (!/^\d+$/.test(id)) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'Asset not found',
			});
		}
		
		await assetService.deleteAsset(id);
		const resDoc = responseHandler(200, 'Asset deleted successfully');
		res.status(200).json(resDoc);
	});

	/**
	 * Download asset file
	 * GET /api/assets/:id/download
	 */
	downloadAsset = catchError(async (req, res, next) => {
		const { id } = req.params;
		
		// Validate that ID is numeric
		if (!/^\d+$/.test(id)) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'Asset not found',
			});
		}

		const fileInfo = await assetService.downloadAsset(id);
		
		// Construct full file path
		const fullPath = path.join(process.cwd(), 'uploads', fileInfo.filePath);
		
		// Check if file exists
		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({
				statusCode: 404,
				status: 'error',
				message: 'File not found on server',
			});
		}
		
		// Get file stats
		const stat = fs.statSync(fullPath);
		const fileSize = stat.size;
		
		// Log headers being set
		console.log('Setting download headers:', {
			fileName: fileInfo.fileName,
			fileSize: fileSize,
			contentDisposition: `attachment; filename="${fileInfo.fileName}"`
		});
		
		// Set proper headers with original filename
		res.setHeader('Content-Length', fileSize);
		res.setHeader('Content-Type', 'application/octet-stream');
		res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
		res.setHeader('Accept-Ranges', 'bytes');
		res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
		
		// Create read stream and pipe to response
		const fileStream = fs.createReadStream(fullPath);
		fileStream.pipe(res);
	});
}

export default new AssetController();
