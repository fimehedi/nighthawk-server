import { Schema, model } from "mongoose";

const socialSchema = new Schema({
  name: {
    type: String
  },
  url: {
    type: String
  },
  icon: {
    type: String
  }
});

export const Social = model("Social", socialSchema);