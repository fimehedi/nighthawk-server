import { Category } from "../../models/category/category.model.mjs";

class CategoryService {

  async createCategory(payload) {

    // create the category
    const category = new Category(payload);

    await category.save();

    return category;
  }

  async updateCategory(id, payload) {
    const category = await Category.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return category;
  }

  async getCategorys() {
    const categorys = await Category.find();
    return categorys;
  }

  async getCategory(id) {
    const category = await Category.findById(id);
    return category;
  }

  async deleteCategory(id) {
    await Category.findByIdAndDelete(id);
  }

}

export default new CategoryService();