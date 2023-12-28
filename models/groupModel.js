import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 30,
      minLength: 1,
    },
    photo: {
      type: String,
    },
    description: {
      type: String,
      maxLength: 1000,
    },
    members: [
      {
        type: mongoose.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("groups", groupSchema, "groups");
