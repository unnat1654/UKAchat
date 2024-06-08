import { cloudinary } from "../config/cloudinary.js";
import {
  getRoomMessages,
  saveMultipleRoomMessages,
} from "../helpers/messageHelpers.js";
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

    try {
      await saveMultipleRoomMessages(chats, userId);
    } catch (error) {
      console.log(error);
      return res.status(409).send({
        success: false,
        message: "Error while saving messages",
      });
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
    const { room, text, iv, doc, extension, timeSent } = req.body;
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
          ...(text && { text, iv }),
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

//get 200 messages in a batch from a contact
//GET  /get-messages?room=""&page=""&firstTime=""&lastTime=""
export const getMessagesController = async (req, res) => {
  try {
    const { _id } = req.user;
    const room = req.query.room;
    const firstTimeInNum = +req.query.firstTime; //oldest local message time
    const lastTimeInNum = +req.query.lastTime; //last local stored message time
    const page = +req.query.page;
    if (page < 1) {
      res.status(200).send({
        success: true,
        message: "No messages found",
        messages: [],
      });
      return;
    }
    const chatsPerPage = 100;
    const fromEndIndex = -(chatsPerPage * page);

    const { totalMessages } = await chatRoomModel
      .findById(room)
      .select("totalMessages");
    if (totalMessages == 0) {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount: 0,
        messages: [],
      });
    }

    const { formatMessages, newMessagesCount } = await getRoomMessages(
      _id,
      room,
      chatsPerPage,
      fromEndIndex,
      totalMessages,
      firstTimeInNum,
      lastTimeInNum,
      page
    );

    if (!formatMessages?.length) {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount: 0,
        messages: [],
      });
    }

    return res.status(200).send({
      success: true,
      message: "Messages found successfully",
      newMessagesCount,
      messages: formatMessages,
      totalPages: Math.ceil(totalMessages / chatsPerPage),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting messages from chat",
      error,
    });
  }
};
