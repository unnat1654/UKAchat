import { cloudinary } from "../config/cloudinary.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST  /save-backup-messages
export const saveBulkMessagesController = async (req, res) => {
  try {
    const chats = req.body; // chats:[{room:String,messages:[{format:bool,sent:bool,text:"",file:"",extension:"",timeSent:DateTime}...]}]
    const userId = req.user._id;

    if (!chats) {
      return res.status(404).send({
        success: false,
        message: "room or messages not found",
      });
    }

    for (const { room, messages } of chats) {
      if (messages.length == 0) continue;
      const lastMessageTime = new Date(messages[messages.length - 1].timeSent);
      const firstMessageTime = new Date(messages[0].timeSent);
      const { user1, user2, chats } = await chatRoomModel.findOne(
        { _id: room },
        { chats: { $slice: -1 } }
      );
      if (user1 != userId && user2 != userId) {
        return res.status(403).send({
          success: false,
          message: "Access Forbidden",
        });
      }
      const contactId = user1 == userId ? user2 : user1;
      const lastSavedMessageTime = chats[0].timeSent;
      if (lastMessageTime <= lastSavedMessageTime) {
        //case 1: all messages are already saved
        continue;
      } else if (firstMessageTime <= lastSavedMessageTime) {
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
      const formattedMessages = [];
      await Promise.all(
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
            throw new Error("Error while saving message backup");
          }
          formattedMessages.push({
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
          });
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
    }
    res.status(201).send({
      success: true,
      message: "All messages saved sucessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while saving messages.",
      error,
    });
  }
};

//POST /send-message-api
export const sendMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { room, text, doc, extension, timeSent } = req.body;
    let secureUrl, publicId;
    if (doc) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(doc, {
        resource_type: "auto",
        folder: "chatMedia",
        format: extension,
      });
      secureUrl = secure_url;
      publicId = public_id;
    }
    const update = {
      $push: {
        chats: {
          sender: userId,
          ...(text && { text }),
          ...(doc && {
            media: { secure_url: secureUrl, public_id: publicId, extension },
          }),
          timeSent,
        },
      },
      $inc: { totalMessages: 1 },
    };
    await chatRoomModel.findByIdAndUpdate(room, update, {
      runValidators: true,
    });
    res.status(201).send({
      success: true,
      message: "Message Sent Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while Sending message",
      error,
    });
  }
};

//GET  /get-last-message/:cid
export const getLastMessageController = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user._id;
    const query = {
      $or: [
        { user1: userId, user2: cid },
        { user2: userId, user1: cid },
      ],
    };
    const data = await chatRoomModel.findOne(query, {
      chats: { $slice: -1 },
    });
    const chats = data?.chats;
    if (data && chats[0]) {
      const lastMessage = chats[0];
      res.status(200).send({
        success: true,
        lastMessageInfo: {
          ...(lastMessage?.text && { lastMessage: lastMessage.text }),
          ...(lastMessage?.media &&
            !lastMessage?.text && { lastMessage: "File Shared" }),
          timeSent: lastMessage.timeSent,
        },
      });
    } else {
      res.status(200).send({
        success: false,
        message: "No Messages Found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting last message from chat.",
      error,
    });
  }
};

//get 200 messages in a batch from a contact
//GET  /get-messages?room=""&page=""&firstTime=""&lastTime=""
export const getMessagesController = async (req, res) => {
  try {
    const { _id } = req.user;
    const room = req.query.room;
    const firstTimeInNum = parseInt(req.query.firstTime); //oldest local message time
    const lastTimeInNum = parseInt(req.query.lastTime); //last local stored message time
    let newMessagesCount = 0;
    const page = parseInt(req.query.page);
    const chatsPerPage = 100;
    const fromEndIndex = -(chatsPerPage * parseInt(page));
    let fetchfrom = fromEndIndex;
    let fetchTill = chatsPerPage;
    const { totalMessages } = await chatRoomModel
      .findById(room)
      .select("totalMessages");
    if (totalMessages == 0) {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount,
        messages: [],
      });
    }
    if (totalMessages < -(fromEndIndex + 1)) {
      fetchfrom = -totalMessages;
      fetchTill = totalMessages - (page - 1) * chatsPerPage;
    }
    const { chats } = await chatRoomModel.findOne(
      { _id: room },
      { chats: { $slice: [fetchfrom, fetchTill] } }
    );

    if (chats) {
      const formatMessages = [];
      if (1 == parseInt(page)) {
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
            ? { format: true, text: chat.text, file: "", extension: "" }
            : {
              format: false,
              file: chat.media.secure_url,
              text: "",
              extension: chat.media.extension,
            }),
          timeSent: chat.timeSent,
          sent: chat.sender == _id,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Messages found successfully",
        newMessagesCount,
        messages: formatMessages,
        totalPages: Math.ceil(totalMessages / chatsPerPage),
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount,
        messages: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting messages from chat",
      error,
    });
  }
};
