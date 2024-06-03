import { Slider } from "../../models/slider/slider.model.mjs";
import isArrayElementExist from "../../utils/isArrayElementExist.mjs";

class SliderService {

  async createSlider(payload) {

    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    // create the slider
    const slider = new Slider({
      ...payload,
      ...images,
    });

    await slider.save();

    return slider;
  }

  async updateSlider(id, payload) {

    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    const slider = await Slider.findByIdAndUpdate
      (id,
        {
          $set: { ...payload, ...images },
        },
        { new: true }
      );
    return slider;
  }

  async getSliders() {
    const sliders = await Slider.find();
    return sliders;
  }

  async getSlidersByPagination({ page = 1, limit = 10, order = desc }) {
    const slidersPromise = Slider.find()
      .sort({ createdAt: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const countPromise = Slider.countDocuments();

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

  async getSlider(id) {
    const slider = await Slider.findById(id);
    return slider;
  }

  async deleteSlider(id) {
    await Slider.findByIdAndDelete(id);
  }

}

export default new SliderService();