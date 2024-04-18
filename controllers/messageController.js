import { cloudinary } from "../config/cloudinary.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST  /save-backup-messages
export const saveBulkMessagesController = async (req, res) => {
  try {
    const messages = req.body; // {room:String,chats:[{format:bool,sent:bool,text:"",file:"",extension:"",timeSent:DateTime}...]}
    const userId = req.user._id;
    if (!messages) {
      return res.status(404).send({
        success: false,
        message: "room or messages not found",
      });
    }
    res.status(201).send({ success: true });

    for (const [room, messages] of Object.entries(messages)) {
      const lastMessageTime = new Date(messages[-1].timeSent);
      const firstMessageTime = new Date(messages[0].timeSent);
      const { user1, user2, chats } = await chatRoomModel.findOne(
        { _id: room },
        { chats: { $slice: -1 } }
      );
      if (user1 != userId && user2 != userId) {
        res.status(403).send({
          success: false,
          message: "Access Forbidden",
        });
      }
      const contactId = user1 == userId ? user2 : user1;
      const lastSavedMessageTime = chats[0].timeSent;
      if (lastMessageTime <= lastSavedMessageTime) {//case 1: all messages are already saved
        continue;
      }
      else if (firstMessageTime <= lastSavedMessageTime) {//case 2: some messages are saved while some are not
        let lastSavedMessageIndex=-1;
        for(let i=0;i<messages.length;i++){
          if(lastSavedMessageTime===new Date(messages[i].timeSent)){
            lastSavedMessageIndex=i;
            break;
          }
        }
        if(lastSavedMessageIndex<0){
          throw new Error("Something unexpected occured while saving messages");
        }
        messages.splice(0,lastSavedMessageIndex+1);
      }
      const formattedMessages = [];
        await Promise.all(
          messages.map(async (message) => {
            let secureUrl="";
            let publicId="";
            if(message.file!==""){
              const { secure_url, public_id } = await cloudinary.uploader.upload(doc, {
                resource_type: "auto",
                folder: "chatMedia",
                format: extension,
              });
              secureUrl=secure_url;
              publicId=public_id;
            }
            if(!secureUrl && !message.text){
              throw new Error("Error while saving message backup");
            }
            formattedMessages.push({
              sender: message.sent ? userId : contactId,
              ...(message.text && { text: message.text }),
              ...(secureUrl && {media:{secure_url:secureUrl,public_id:publicId,extension:message.extension}}),
              timeSent:new Date(message.timeSent)
            });
          })
        );
        await chatRoomModel.findByIdAndUpdate(room, {$push:{chats:{$each:formattedMessages}}},{runValidators:true});

    }
    res.status(201).send({
      success:true,
      message:"All messages saved sucessfully"
    })
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
//GET  /get-messages?room=""&page=""&time=""
export const getMessagesController = async (req, res) => {
  const userId = req.user._id;
  const room=req.query.room;
  const page=parseInt(req.query.page);
  const time=new Date(req.query.time);//oldest local message time
  const timeInNum= time.getTime();
  try {
    const chatsPerPage = 200;
    let fromEndIndex = -chatsPerPage * page;
    const { chats } = await chatRoomModel
      .findOne(
        { _id: room },
        { chats: { $slice: [fromEndIndex, chatsPerPage] } }
      )
      .select("chats");
    if (chats) {
      const formatMessages = [];
      for(let chat of chats){
        let timeSent= new Date(chat.timeSent);
        if(timeSent.getTime()>=timeInNum){
          continue;
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
          sent: chat.sender == userId,
        });
      }

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
