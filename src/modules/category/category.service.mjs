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

  async getCategorysByPagination({ page = 1, limit = 10, order = 'desc' }) {
    const categorysPromise = Category.find()
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const countPromise = Category.countDocuments();

    const [categorys, total] = await Promise.all([categorysPromise, countPromise]);

    const totalPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      result: categorys,
      pagination: {
        total,
        totalPage,
        currentPage,
      }
    };
  }

  async getCategory(id) {
    const category = await Category.findById(id).populate('sub_categories');
    return category;
  }

  async deleteCategory(id) {
    await Category.findByIdAndDelete(id);
  }

}

export default new CategoryService();