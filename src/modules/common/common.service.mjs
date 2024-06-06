import { Asset } from "../../models/asset/asset.model.mjs";
import { Category } from "../../models/category/category.model.mjs";
import { SubCategory } from "../../models/sub-category/sub.category.model.mjs";

class CommonService {
	async search(searchTerm) {

		// category find by name and short_description
		const category = await Category.find({
			$or: [
				{ name: { $regex: searchTerm, $options: 'i' } },
				{ short_description: { $regex: searchTerm, $options: 'i' } },
			],
		});

		const subCategory = await SubCategory.find({
			$or: [
				{ name: { $regex: searchTerm, $options: 'i' } },
				{ short_description: { $regex: searchTerm, $options: 'i' } },
			],
		});

		const asset = await Asset.find({
			$or: [
				{ name: { $regex: searchTerm, $options: 'i' } },
				{ description: { $regex: searchTerm, $options: 'i' } },
			],
		});

		return {
			category,
			subCategory,
			asset,
		};
	}
}

export default new CommonService();
