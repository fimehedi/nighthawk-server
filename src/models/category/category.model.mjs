import { Schema, model } from "mongoose";

const categorySchema = new Schema({
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

export const Category = model("Category", categorySchema);