import { Slider } from "../../models/slider/slider.model.mjs";

class SliderService {

  async createSlider(payload) {

    // create the slider
    const slider = new Slider(payload);

    await slider.save();

    return slider;
  }

  async updateSlider(id, payload) {
    const slider = await Slider.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return slider;
  }

  async getSliders() {
    const sliders = await Slider.find();
    return sliders;
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