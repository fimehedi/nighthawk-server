import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    // required: true,
  },
  short_description: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  sub_categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    }
  ]
});

export const Category = model("Category", categorySchema);