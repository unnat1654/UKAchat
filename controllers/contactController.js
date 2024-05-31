import { contactDetailsFinder } from "../helpers/contactHelpers.js";
import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";

//GET /get-room
export const getRoomController = async (req, res) => {
  try {
    const user1 = req.user._id;
    const user2 = req.params.contactId;
    const roomAlreadyExists = await chatRoomModel.findOne({
      $or: [
        { user1: user1, user2: user2 },
        { user1: user2, user2: user1 },
      ],
    });
    if (roomAlreadyExists) {
      res.status(200).send({
        success: true,
        message: "Room already exists",
        room: roomAlreadyExists._id,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Room Not Found",
      });
    }
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
      res.status(404).send({
        success: false,
        message: "Not allowed to enter self ContactId",
      });
    }
    const contact = await userModel
      .findOne({ _id: contactId })
      .select("-password -DOB -email -phone -name");
    if (contact) {
      res.status(200).send({
        success: true,
        message: "Chat found",
        contact,
      });
    } else {
      res.status(200).send({
        success: false,
        messsage: "Chat not found",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while searching for chat",
      contactId,
      userId: req.user._id,
      error,
    });
  }
};

//get the 20 users who last sent a message to user. (sorted in descending order according to recent message)
//GET  /get-contacts
export const getContactsController = async (req, res) => {
  const user = req.user._id;
  const limit = 20;
  try {
    const contactDetailsArray = await contactDetailsFinder(user, limit);
    res.status(200).send({
      success: true,
      message: "First 20 Contacts Found Successfully",
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
  const user = req.user._id;
  const limit = null;
  try {
    const contactDetailsArray = await contactDetailsFinder(user, limit);
    // returing: {_id,username,photo:{securl_url,public_id}}
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
