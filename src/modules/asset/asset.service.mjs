import { AssetImage } from '../../models/asset/asset.image.model.mjs';
import { Asset } from '../../models/asset/asset.model.mjs';
import { SubCategory } from '../../models/sub-category/sub.category.model.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class AssetService {
	async createAsset(payload) {
		console.log(payload.files);

		const cover = {};
		const images = [];
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

		// create the asset
		const subCategory = await SubCategory.findById(payload.sub_category);

		if (!subCategory) {
			throw new Error('SubCategory not found');
		}

		// create the asset
		const asset = new Asset({
			...payload,
			...cover,
		});

		// create asset images
		const assetImages = images.map((image) => ({
			image: image.image,
			asset: asset._id,
		}));

		const newAssetImages = await AssetImage.insertMany(assetImages);

		asset.images = newAssetImages.map((image) => image._id);
		await asset.save();
		subCategory.assets.push(asset);
		await subCategory.save();
		return asset;
	}

	async updateAsset(id, payload) {
		const cover = {};
		const images = [];
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

		const asset = await Asset.findByIdAndUpdate(
			id,
			{
				$set: {
					...payload,
					...cover,
				},
			},
			{ new: true }
		);

		// create asset images
		const assetImages = images.map((image) => ({
			image: image.image,
			asset: asset._id,
		}));

		const newAssetImages = await AssetImage.insertMany(assetImages);
		asset.images = [
			...asset.images,
			...newAssetImages.map((image) => image._id),
		];

		await asset.save();

		return asset;
	}

	async getAssets() {
		const assets = await Asset.find().populate([
			{
				path: 'sub_category',
			},
			{
				path: 'images',
			},
		]);
		return assets;
	}

	async getAssetsByPagination({ page = 1, limit = 10, order = 'desc' }) {
		const assetsPromise = Asset.find()
			.sort({ createdAt: order === 'asc' ? 1 : -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate([
				{
					path: 'images',
				},
			]);

		const countPromise = Asset.countDocuments();

		const [assets, total] = await Promise.all([assetsPromise, countPromise]);

		const totalPage = Math.ceil(total / limit);
		const currentPage = page;

		return {
			result: assets,
			pagination: {
				total,
				totalPage,
				currentPage,
			},
		};
	}

	async getAsset(id) {
		const asset = await Asset.findById(id).populate([
			{
				path: 'sub_category',
			},
			{
				path: 'images',
			},
		]);
		return asset;
	}

	async deleteAsset(id) {
		await Asset.findByIdAndDelete(id);
	}
}

export default new AssetService();
