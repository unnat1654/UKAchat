import { cloudinary } from "../config/cloudinary.js";
import chatRoomModel from "../models/chatRoomModel.js";

export const saveMultipleRoomMessages= async (chats,userId)=>{
    await Promise.all(chats.map(async({room, messages})=>{
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
        const lastSavedMessageTime = chats[0].timeSent;
        if (lastMessageTime <= lastSavedMessageTime) {
          //case 1: all messages are already saved
          return;
        } 
        if (firstMessageTime <= lastSavedMessageTime) {
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
              throw new Error("Error while saving message backup, no text or file found.");
            }
            return {
              sender: message.sent ? userId : contactId,
              ...(message.text && { text: message.text }),
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
      }));
}