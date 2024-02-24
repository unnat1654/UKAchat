import { cloudinary } from "../config/cloudinary.js";
import chatModel from "../models/chatModel.js";

//POST  /save-messages
export const saveMessagesController = async (req, res) => {
  try {
    const { room, messages } = req.body;
    if (!room || !messages) {
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


//GET  /get-last-message/:cid
export const getLastMessageController = async (req, res) => {
  const { cid } = req.params;
  const userId = req.user._id;
  try {
    const lastMessage = await chatModel.findOne({
      $or: [
        { sender: cid, receiver: userId },
        { sender: userId, receiver: cid },
      ],
    });
    if (lastMessage?.message) {
      res.status(200).send({
        success: true,
        lastMessageInfo: {
          lastMessage: lastMessage.message,
          timeSent: lastMessage.timeSent,
        },
      });
    } else if (lastMessage?.media) {
      res.status(200).send({
        success: true,
        lastMessageInfo: {
          lastMessage: "File Shared",
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
  const { room, page } = req.params;
  try {
    const chatsPerPage = 200;
    const messages = await chatModel
      .find({ room: room })
      .sort({ timeSent: -1 })
      .skip((page - 1) * chatsPerPage)
      .limit(chatsPerPage)
      .select("-_id -room");
    if (messages) {
      res.status(200).send({
        success: true,
        message: "Messages found successfully",
        messages,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No messages found",
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
