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
		const asset = await assetService.updateAsset(req.params.id, {
			...req.body,
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
		const asset = await assetService.getAsset(req.params.id);
		const resDoc = responseHandler(200, 'Asset retrieved successfully', asset);
		res.status(200).json(resDoc);
	});

	deleteAsset = catchError(async (req, res, next) => {
		await assetService.deleteAsset(req.params.id);
		const resDoc = responseHandler(200, 'Asset deleted successfully');
		res.status(200).json(resDoc);
	});
}

export default new AssetController();
