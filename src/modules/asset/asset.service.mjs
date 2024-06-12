import { prisma } from '../../db/prisma.mjs';
import { Asset } from '../../models/asset/asset.model.mjs';

class AssetService {
	async createAsset(payload) {

		delete payload.files;

		const asset = await prisma.asset.create({
			data: {
				...payload,
				sub_category_id: parseInt(payload.sub_category_id),
				cover: 'cover.jpg',
			}
		});

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
		// const assets = await Asset.find().populate('sub_category');
		const assets = await prisma.asset.findMany({
			include: {
				sub_category: true,
			},
		});
		return assets;
	}

	async getAssetsByPagination({ page = 1, limit = 10, order = 'desc' }) {
		// const assetsPromise = Asset.find()
		// 	.sort({ createdAt: order === 'asc' ? 1 : -1 })
		// 	.skip((page - 1) * limit)
		// 	.limit(limit);

		const assetsPromise = prisma.asset.findMany({
			include: {
				sub_category: true,
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
			result: assets,
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
			},
		});
		return asset;
	}

	async deleteAsset(id) {
		await prisma.asset.delete({
			where: {
				id: parseInt(id),
			},
		});
	}
}

export default new AssetService();
