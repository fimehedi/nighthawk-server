import { Schema, model } from "mongoose";

const pagesSchema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  cover: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
  },
  content: {
    type: String,
  },
});

export const Page = model("Page", pagesSchema);