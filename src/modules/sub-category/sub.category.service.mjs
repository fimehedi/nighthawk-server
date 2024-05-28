import { Category } from "../../models/category/category.model.mjs";
import { SubCategory } from "../../models/sub-subCategory/sub.subCategory.model.mjs";

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
    const subCategorys = await SubCategory.find();
    return subCategorys;
  }

  async getSubCategory(id) {
    const subCategory = await SubCategory.findById(id);
    return subCategory;
  }

  async deleteSubCategory(id) {
    await SubCategory.findByIdAndDelete(id);
  }

}

export default new SubCategoryService();