import { cloudinary } from "../config/cloudinary.js";
import { saveMultipleRoomMessages } from "../helpers/messageHelpers.js";
import chatRoomModel from "../models/chatRoomModel.js";
import queryCache from "../helpers/queryCacheHelpers.js";


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
        message: "Error while saving messages"
      })
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

    let chat= await queryCache.get(`chatRoomModel-findOne-lastChat:${userId},${cid}`);
    if(!chat) {
      const query = {
        $or: [
          { user1: userId, user2: cid },
          { user2: userId, user1: cid },
        ],
      };
      const { chats } = await chatRoomModel.findOne(query, {
        chats: { $slice: -1 },
      }).select("chats");
      if (chats.length) chat = chats[0];

      await queryCache.set(`chatRoomModel-findOne-lastChat:${userId},${cid}`, chat, 10);
    }

    if (!chat) {
      return res.status(200).send({
        success: false,
        message: "No Messages Found",
      });
    }

    res.status(200).send({
      success: true,
      message:"last message found successfully",
      lastMessageInfo: {
        ...(chat.text && { lastMessage: chat.text }),
        ...(chat.media &&
          !chat.text && { lastMessage: "File Shared" }),
        timeSent: chat.timeSent,
      },
    });
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
    const firstTimeInNum = +req.query.firstTime; //oldest local message time
    const lastTimeInNum = +req.query.lastTime; //last local stored message time
    const page = +req.query.page;
    const chatsPerPage = 100;
    const fromEndIndex = -(chatsPerPage * page);

    const { totalMessages} = await chatRoomModel
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

    let fetchfrom = fromEndIndex;
    let fetchTill = chatsPerPage;
    if (totalMessages < -(fromEndIndex + 1)) {
      fetchfrom = -totalMessages;
      fetchTill = totalMessages - (page - 1) * chatsPerPage;
    }
    const { chats } = await chatRoomModel.findOne(
      { _id: room },
      { chats: { $slice: [fetchfrom, fetchTill] } }
    ).select("chats");

    if (!chats.length) {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount: 0,
        messages: [],
      });
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

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting messages from chat",
      error,
    });
  }
};
