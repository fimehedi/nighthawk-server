import { Asset } from '../../models/asset/asset.model.mjs';
import { SubCategory } from '../../models/sub-category/sub.category.model.mjs';

class AssetService {
	async createAsset(payload) {
		// create the asset
		const subCategory = await SubCategory.findById(payload.sub_category);

		if (!subCategory) {
			throw new Error('SubCategory not found');
		}

		// create the asset
		const asset = new Asset(payload);
		await asset.save();

		subCategory.assets.push(asset);
		await subCategory.save();
		return asset;
	}

	async updateAsset(id, payload) {
		const asset = await Asset.findByIdAndUpdate(
			id,
			{
				$set: payload,
			},
			{ new: true }
		);
		return asset;
	}

	async getAssets() {
		const assets = await Asset.find().populate('sub_category');
		return assets;
	}

	async getAssetsByPagination({ page = 1, limit = 10, order = 'desc' }) {
		const assetsPromise = Asset.find()
			.sort({ createdAt: order === 'asc' ? 1 : -1 })
			.skip((page - 1) * limit)
			.limit(limit);

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
		const asset = await Asset.findById(id).populate('sub_category');
		return asset;
	}

	async deleteAsset(id) {
		await Asset.findByIdAndDelete(id);
	}
}

export default new AssetService();
