import { prisma } from '../../db/prisma.mjs';

class CommonService {
	async search(searchTerm) {
		// category find by name and short_description
		// const category = await Category.find({
		// 	$or: [
		// 		{ name: { $regex: searchTerm, $options: 'i' } },
		// 		{ short_description: { $regex: searchTerm, $options: 'i' } },
		// 	],
		// });

		// const subCategory = await SubCategory.find({
		// 	$or: [
		// 		{ name: { $regex: searchTerm, $options: 'i' } },
		// 		{ short_description: { $regex: searchTerm, $options: 'i' } },
		// 	],
		// });

		// const asset = await Asset.find({
		// 	$or: [
		// 		{ name: { $regex: searchTerm, $options: 'i' } },
		// 		{ description: { $regex: searchTerm, $options: 'i' } },
		// 	],
		// });

		const categoryPromise = prisma.category.findMany({
			where: {
				OR: [
					{ name: { contains: searchTerm, } },
					{ short_description: { contains: searchTerm, } },
				],
			},
		});

		const subCategoryPromise = prisma.subCategory.findMany({
			where: {
				OR: [
					{ name: { contains: searchTerm, } },
					{ short_description: { contains: searchTerm, } },
				],
			},
		});

		const assetPromise = prisma.asset.findMany({
			where: {
				OR: [
					{ name: { contains: searchTerm, } },
					{ short_description: { contains: searchTerm, } },
				],
			},
		});

		const [category, subCategory, asset] = await Promise.all([
			categoryPromise,
			subCategoryPromise,
			assetPromise,
		]);

		return {
			category,
			subCategory,
			asset,
		};
	}
}

export default new CommonService();
