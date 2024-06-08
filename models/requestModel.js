import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    immutable: true,
  },
  senderPublicKey: {
    type: String,
    required: true,
    immutable: true,
  },
  recieverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    immutable: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  timeSent: {
    type: Date,
    required: true,
    immutable: true,
  },
});

export default mongoose.model("requests", requestSchema, "requests");
