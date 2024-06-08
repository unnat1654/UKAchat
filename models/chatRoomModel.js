import mongoose from "mongoose";

const userRoomSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  user1PublicKey: {
    type: String,
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  user2PublicKey: {
    type: String,
    required: true,
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
        iv: {
          type: String,
          maxLength: 500,
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
