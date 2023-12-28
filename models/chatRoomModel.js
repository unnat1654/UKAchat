import mongoose from "mongoose";

const userRoomSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
});

export default mongoose.model("userRooms", userRoomSchema, "userRooms");
