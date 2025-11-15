import { prisma } from '../../db/prisma.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class SketchShaperProCategoryService {
  async createCategory(payload) {
    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    delete payload.files;

    // Create the category
    const category = await prisma.sketchShaperProCategory.create({
      data: { ...payload, ...images },
    });
    return category;
  }

  async updateCategory(id, payload) {
    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    delete payload.files;
    const category = await prisma.sketchShaperProCategory.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...payload,
        ...images,
      },
    });
    return category;
  }

  async getCategories() {
    const categories = await prisma.sketchShaperProCategory.findMany({
      include: {
        files: {
          where: {
            upload_status: 'completed'
          },
          orderBy: {
            created_at: 'desc'
          }
        },
      },
      orderBy: {
        id: 'desc',
      }
    });
    return categories;
  }

  async getCategoriesByPagination({ page = 1, limit = 10, order = 'desc' }) {
    const categoriesPromise = prisma.sketchShaperProCategory.findMany({
      take: limit || 10,
      skip: (page - 1) * limit,
      orderBy: [
        {
          id: order,
        },
      ],
      include: {
        files: {
          where: {
            upload_status: 'completed'
          },
          orderBy: {
            created_at: 'desc'
          }
        },
      },
    });

    const countPromise = prisma.sketchShaperProCategory.count();

    const [categories, total] = await Promise.all([
      categoriesPromise,
      countPromise,
    ]);

    const totalPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      result: categories,
      pagination: {
        total,
        totalPage,
        currentPage,
      },
    };
  }

  async getCategory(id) {
    const category = await prisma.sketchShaperProCategory.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        files: {
          where: {
            upload_status: 'completed'
          },
          orderBy: {
            created_at: 'desc'
          }
        },
      },
    });
    
    return category;
  }

  async deleteCategory(id) {
    await prisma.sketchShaperProCategory.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
}

export default new SketchShaperProCategoryService();
