import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
}, {
  timestamps: true,
});

export const Admin = model("Admin", adminSchema);