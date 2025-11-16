import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import assetService from './asset.service.mjs';

class AssetController {
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
}

export default new AssetController();
