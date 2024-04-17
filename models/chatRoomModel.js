import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  text: {
    type: String,
    maxLength: 30000,
  },
  media: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
    extension: {
      type: String,
    },
  },
  timeSent: {
    type: Date,
    required: true,
  },
});
chatSchema.path("message")?.validate((value) => {
  return value || (this.media && this.media.secure_url && this.media.public_id);
}, "Either message or media with secure_url and public_id should be provided");

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
  chats: [chatSchema],
});

export default mongoose.model("userRooms", userRoomSchema, "userRooms");
