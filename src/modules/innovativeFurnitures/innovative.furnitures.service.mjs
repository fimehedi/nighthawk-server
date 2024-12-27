import { prisma } from "../../db/prisma.mjs";
import isArrayElementExist from "../../utils/isArrayElementExist.mjs";

class InnovativeFurnituresService {

  async createInnovative(payload) {

    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    const innovative = await prisma.innovativeFurnitures.create({
      data: {
        ...payload,
        bgImg: images.bgImg || '',
      }
    });
    return innovative;
  }

  async updateInnovative(id, payload) {

    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }


    const slider = await prisma.slider.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: payload.name,
        short_description: payload.short_description,
        ...images
      }
    });
    return slider;
  }

  async getInnovative() {
    // const sliders = await Slider.find();
    const sliders = await prisma.slider.findMany();
    return sliders;
  }

  async getInnovativesByPagination({ page = 1, limit = 10, order = 'desc' }) {

    const slidersPromise = await prisma.slider.findMany({
      take: limit || 10,
      skip: (page - 1) * limit,
      orderBy: [
        {
          id: order
        }
      ]

    });

    // const countPromise = Slider.countDocuments();
    const countPromise = prisma.slider.count();

    const [sliders, total] = await Promise.all([slidersPromise, countPromise]);

    const totalPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      result: sliders,
      pagination: {
        total,
        totalPage,
        currentPage,
      }
    };

  }

  async getInnovativeById(id) {
    // const slider = await Slider.findById(id);
    const slider = await prisma.slider.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    return slider;
  }

  async deleteInnovative(id) {
    await prisma.slider.delete({
      where: {
        id: parseInt(id)
      }
    });
  }

}

export default new InnovativeFurnituresService();