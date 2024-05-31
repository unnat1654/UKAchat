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
  chats: {
    type: [
      {
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
      },
    ],
    default: [],
  },
  totalMessages: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("userRooms", userRoomSchema, "userRooms");
