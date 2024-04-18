import { cloudinary } from "../config/cloudinary.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST  /save-backup-messages
export const saveBulkMessagesController = async (req, res) => {
  try {
    const messages = req.body;
    const user = req.user._id;
    if (!messages) {
      return res.status(404).send({
        success: false,
        message: "room or messages not found",
      });
    }
    let itemToBeInserted = [];

    for (i = 0; i < messages.length; i++) {
      let element = messages[i];
      if (element.message) {
        let messageObject = {
          room: room,
          message: element.message,
          sender: element.sender,
          receiver: element.receiver,
          timeSent: element.timeSent,
        };
        itemToBeInserted.append(messageObject);
      } else if (element.data) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          photo,
          {
            folder: "chatMedia",
          }
        );
        let messageObject = {
          room: room,
          media: { public_id, secure_url },
          sender: element.sender,
          receiver: element.receiver,
          timeSent: element.timeSent,
        };

        itemToBeInserted.append(messageObject);
      }
    }
    await chatModel.insertMany(itemToBeInserted);
    res.status(201).send({ success: true });
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
    const { room, receiver, text, doc, extension, timeSent } = req.body;
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
  const { cid } = req.params;
  const userId = req.user._id;
  try {
    const query = {
      $or: [
        { user1: userId, user2: cid },
        { user2: userId, user1: cid },
      ],
    };
    const { chats } = await chatRoomModel.findOne(query, {
      chats: { $slice: -1 },
    });
    let lastMessage = chats[0];
    if (lastMessage) {
      res.status(200).send({
        success: true,
        lastMessageInfo: {
          ...(lastMessage?.text && { lastMessage: lastMessage.text }),
          ...(lastMessage?.media && { lastMessage: "File Shared" }),
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
//GET  /get-messages/:room/:page
export const getMessagesController = async (req, res) => {
  const userId = req.user._id;
  const { room, page } = req.params;
  try {
    const chatsPerPage = 200;
    const fromEndIndex = -(chatsPerPage * page);
    const { chats } = await chatRoomModel
      .findOne(
        { _id: room },
        { chats: { $slice: [fromEndIndex, chatsPerPage] } }
      )
      .select("chats");
    if (chats) {
      const formatMessages = [];
      chats.forEach((chat) => {
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
          sent: chat.sender == userId,
        });
      });

      res.status(200).send({
        success: true,
        message: "Messages found successfully",
        messages: formatMessages,
      });
    } else {
      res.status(200).send({
        success: true,
        message: "No messages found",
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
