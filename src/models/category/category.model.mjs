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
  ],

  metaTitle: {
    type: String,
    
  },

  metaDescription: {
    type: String,
    
  },

});

export const Category = model("Category", categorySchema);