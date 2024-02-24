import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    maxLength: 30,
    minLength: 1,
    required: true,
  },
  email: {
    type: String,
    maxLength: 50,
    minLength: 3,
    required: true,
    unique: true,
    immutable: true,
  },
  name: {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  DOB: {
    type: Date,
    required: true,
    immutable: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    maxLength: 12,
    required: true,
    unique: true,
    immutable: true,
  },
  //cloudinary needs public_id, secure_url
  photo: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  lastOnline: {
    type: Date,
  },
});

export default mongoose.model("users", userSchema, "users");
