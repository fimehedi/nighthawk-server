import { prisma } from '../../db/prisma.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class AssetService {
	async createAsset(payload) {
		console.log('payload', payload);

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

		await prisma.assetImage.createMany({
			data: assetImages,
		});

		return asset;
	}

	async updateAsset(id, payload) {
		console.log('payload', payload);
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

		await prisma.asset.update({
			where: {
				id: parseInt(id),
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
			asset_id: parseInt(id),
		}));

		await prisma.assetImage.createMany({
			data: assetImages,
		});

		return true;
	}

	async getAssets() {
		// const assets = await Asset.find().populate('sub_category');
		const assets = await prisma.asset.findMany({
			include: {
				sub_category: true,
			},
			orderBy: {
				id: 'desc',
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
				images: true,
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
				images: true,
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
