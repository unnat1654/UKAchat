import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  //userid,senderid,roomid,time,message all are immutable
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userRooms",
    required: true,
    index: -1,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  message: {
    type: String,
    maxLength: 10000,
  },
  media: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  timeSent: {
    type: Date,
    required: true,
  },
});

chatSchema.index({
  timeSent: -1,
});
export default mongoose.model("userChats", chatSchema, "userChats");
