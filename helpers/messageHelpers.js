import { cloudinary } from "../config/cloudinary.js";
import chatRoomModel from "../models/chatRoomModel.js";

export const saveMultipleRoomMessages = async (userChats, userId) => {
  await Promise.all(
    userChats.map(async ({ room, messages }) => {
      if (messages.length == 0) return;
      const lastMessageTime = new Date(messages[messages.length - 1].timeSent);
      const firstMessageTime = new Date(messages[0].timeSent);

      const { user1, user2, chats } = await chatRoomModel.findOne(
        { _id: room },
        { chats: { $slice: -1 } }
      );
      if (user1 != userId && user2 != userId) {
        throw new Error("Access Forbidden");
      }
      const contactId = user1 == userId ? user2 : user1;
      const lastSavedMessageTime = chats[0]?.timeSent;
      if (lastSavedMessageTime && lastMessageTime <= lastSavedMessageTime) {
        //case 1: all messages are already saved
        return;
      }
      if (lastSavedMessageTime && firstMessageTime <= lastSavedMessageTime) {
        //case 2: some messages are saved while some are not
        let lastSavedMessageIndex = -1;
        for (let i = 0; i < messages.length; i++) {
          if (lastSavedMessageTime === new Date(messages[i].timeSent)) {
            lastSavedMessageIndex = i;
            break;
          }
        }
        if (lastSavedMessageIndex < 0) {
          throw new Error("Something unexpected occured while saving messages");
        }
        messages.splice(0, lastSavedMessageIndex + 1);
      }
      const formattedMessages = await Promise.all(
        messages.map(async (message) => {
          let secureUrl = "";
          let publicId = "";
          if ("" !== message.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
              doc,
              {
                resource_type: "auto",
                folder: "chatMedia",
                format: extension,
              }
            );
            secureUrl = secure_url;
            publicId = public_id;
          }
          if (!secureUrl && "" == message.text) {
            throw new Error(
              "Error while saving message backup, no text or file found."
            );
          }
          return {
            sender: message.sent ? userId : contactId,
            ...(message.text && { text: message.text, iv: message.iv }),
            ...(secureUrl && {
              media: {
                secure_url: secureUrl,
                public_id: publicId,
                extension: message.extension,
              },
            }),
            timeSent: new Date(message.timeSent),
          };
        })
      );
      await chatRoomModel.findByIdAndUpdate(
        room,
        {
          $push: { chats: { $each: formattedMessages } },
          $inc: { totalMessages: formattedMessages.length },
        },

        { runValidators: true }
      );
    })
  );
};

export const getRoomMessages = async (
  _id,
  room,
  chatsPerPage,
  fromEndIndex,
  totalMessages,
  firstTimeInNum,
  lastTimeInNum,
  page
) => {
  let fetchfrom = fromEndIndex;
  let fetchTill = chatsPerPage;
  if (totalMessages < -(fromEndIndex + 1)) {
    fetchfrom = -totalMessages;
    fetchTill = totalMessages - (page - 1) * chatsPerPage;
  }

  const { chats } = await chatRoomModel
    .findOne({ _id: room })
    .select({ chats: { $slice: [fetchfrom, fetchTill] } });

  if (!chats.length) {
    return [];
  }
  let newMessagesCount = 0;
  const formatMessages = [];
  if (1 == page) {
    for (let chat of chats) {
      let timeSent = new Date(chat.timeSent);
      if (timeSent.getTime() > lastTimeInNum) {
        newMessagesCount++;
      }
    }
  }
  for (let chat of chats) {
    if (0 == newMessagesCount && 1 == page) {
      let timeSent = new Date(chat.timeSent);
      if (timeSent.getTime() >= firstTimeInNum) {
        continue;
      }
    }
    formatMessages.push({
      ...(chat.text
        ? {
            format: true,
            text: chat.text,
            iv: chat.iv,
            file: "",
            extension: "",
          }
        : {
            format: false,
            file: chat.media.secure_url,
            text: "",
            iv: "",
            extension: chat.media.extension,
          }),
      timeSent: chat.timeSent,
      sent: chat.sender == _id,
    });
  }
  return { formatMessages, newMessagesCount };
};
