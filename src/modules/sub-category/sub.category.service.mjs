import { Category } from "../../models/category/category.model.mjs";
import { SubCategory } from "../../models/sub-category/sub.category.model.mjs";

class SubCategoryService {

  async createSubCategory(payload) {

    const category = await Category.findById(payload.category);

    if (!category) {
      throw new Error("Category not found");
    }

    // create the subCategory
    const subCategory = new SubCategory(payload);

    await subCategory.save();
    category.sub_categories.push(subCategory);
    await category.save();

    return subCategory;
  }

  async updateSubCategory(id, payload) {
    const subCategory = await SubCategory.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return subCategory;
  }

  async getSubCategorys() {
    const subCategorys = await SubCategory.find().populate('category');
    return subCategorys;
  }

  async getSubCategorysByPagination({ page = 1, limit = 10, order = 'desc' }) {
    const subCategorysPromise = SubCategory.find()
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category');

    const countPromise = SubCategory.countDocuments();

    const [subCategorys, total] = await Promise.all([subCategorysPromise, countPromise]);

    const totalPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      result: subCategorys,
      pagination: {
        total,
        totalPage,
        currentPage,
      }
    };

  }

  async getSubCategory(id) {
    const subCategory = await SubCategory.findById(id).populate('category');
    return subCategory;
  }

  async deleteSubCategory(id) {
    await SubCategory.findByIdAndDelete(id);
  }

}

export default new SubCategoryService();