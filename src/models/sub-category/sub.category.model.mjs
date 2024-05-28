import { Schema, model } from "mongoose";

const subcategorySchema = new Schema({
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
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  assets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    }
  ]
});

export const SubCategory = model("SubCategory", subcategorySchema);