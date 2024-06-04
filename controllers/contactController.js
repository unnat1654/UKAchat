import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";
import queryCache from "../helpers/queryCacheHelpers.js";
import { contactDetailsFinder } from "../helpers/contactHelpers.js";


//GET /get-room
export const getRoomController = async (req, res) => {
  try {
    const user1 = req.user._id;
    const user2 = req.params.contactId;

    let roomAlready = await queryCache.get(`chatRoomModel-findOne-nochats:${user1},${user2}`);
    if (!roomAlready) {
      roomAlready = await chatRoomModel.findOne({
        $or: [
          { user1: user1, user2: user2 },
          { user1: user2, user2: user1 }
        ]
      }).select("_id user1 user2");
      await queryCache.set(`chatRoomModel-findOne-nochats:${user1},${user2}`, roomAlready, 300);
    }

    if (!roomAlready) {
      return res.status(404).send({
        success: false,
        message: "Room Not Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Room already exists",
      room: roomAlready._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while creating room",
      error,
    });
  }
};

//GET  /search-contact/:contactId
export const searchContactContoller = async (req, res) => {
  try {
    const { contactId } = req.params;

    if (contactId == req.user._id) {
      return res.status(404).send({
        success: false,
        message: "Not allowed to enter self ContactId",
      });
    }

    let contact = await queryCache.get(`contactModel-findOne:${contactId}`);
    if (!contact) {
      contact = await userModel
        .findOne({ _id: contactId })
        .select("-password -DOB -email -phone -name");
      await queryCache.set(`contactModel-findOne:${contactId}`, contact, 30);
    }

    if (!contact) {
      return res.status(200).send({
        success: false,
        messsage: "Chat not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Chat found",
      contact,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while searching for chat",
      error,
    });
  }
};

//get the 20 users who last sent a message to user. (sorted in descending order according to recent message)
//GET  /get-contacts
export const getContactsController = async (req, res) => {
  try {
    const user = req.user._id;
    const limit = 20;

    let contactDetailsArray=await queryCache.get(`contactModel-contacts:${user}`);
    if(!contactDetailsArray){
      contactDetailsArray = await contactDetailsFinder(user, limit);
      await queryCache.set(`contactModel-contacts:${user}`,contactDetailsArray,15);
    }

    res.status(200).send({
      success: true,
      message: `First ${limit} Contacts Found Successfully`,
      contactDetailsArray,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting Contacts",
      error,
    });
  }
};

//GET  /get-all-contacts
export const getAllContactsController = async (req, res) => {
  try {
    const user = req.user._id;

    let contactDetailsArray=await queryCache.get(`contactModel-all-contacts:${user}`);
    if(!contactDetailsArray){

      contactDetailsArray = await contactDetailsFinder(user, null);
      // returing: {_id,username,photo:{securl_url,public_id}}

      await queryCache.set(`contactModel-all-contacts:${user}`,contactDetailsArray,15);
    }
    
    res.status(200).send({
      success: true,
      message: "Contacts Found Successfully",
      contactDetailsArray,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting Contacts",
      error,
    });
  }
};
