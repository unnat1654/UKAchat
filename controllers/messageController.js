import { cloudinary } from "../config/cloudinary.js";
import chatModel from "../models/chatModel.js";

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
          receiver: element.reciever,
          timeSent: element.timeSent,
        };
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
          receiver: element.reciever,
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

export const getLastMessageController = async (req, res) => {
  const { room } = req.params;
  try {
    const lastMessage = await chatModel.findOne({ room: room });
    if (lastMessage?.message) {
      res.status(200).send({
        lastMessage: lastMessage.message,
      });
    } else if (lastMessage?.media) {
      res.status(200).send({
        success: true,
        lastMessage: "File Shared",
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
export const getMessagesController = async (req, res) => {
  const { room, page } = req.params;
  try {
    const chatsPerPage = 200;
    const messages = await chatModel
      .find({ room: room })
      .sort({ createdAt: -1 })
      .skip((page + 1) * chatsPerPage)
      .limit(chatsPerPage)
      .select("-room");
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
