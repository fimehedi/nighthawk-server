import { Schema, model } from "mongoose";

const sliderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
  },
});

export const Slider = model("Slider", sliderSchema);