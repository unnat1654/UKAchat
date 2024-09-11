import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 30,
      minLength: 1,
    },
    photo: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    description: {
      type: String,
      maxLength: 1000,
    },
    admin: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      ],
    },
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      ],
      validate: [
        memberLimitValidator,
        "{PATH} exceeds the limit of {MAXLENGTH}",
      ],
      default: [],
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
  },
  { timestamps: true }
);

function memberLimitValidator(val) {
  return val.length <= 5; // Limits the array to 5 elements
}

export default mongoose.model("groups", groupSchema, "groups");
