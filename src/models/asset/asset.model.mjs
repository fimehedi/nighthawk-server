import { Schema, model } from "mongoose";

const assetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
  },
  resolution: {
    type: String,
  },
  images: {
    type: Array,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  }
});

export const Asset = model("Asset", assetSchema);