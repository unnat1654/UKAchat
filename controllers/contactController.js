import { contactDetailsFinder } from "../helpers/contactHelpers.js";
import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import onlineUsers from "../helpers/onlineUsers.js";

//POST /create-room
export const getRoomController = async (req, res) => {
  try {
    const user1 = req.user._id;
    const user2 = req.body.contactId;
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

//GET /get-online-contacts
export const getOnlineContactController = async (req, res) => {
  try {
    const user = req.user._id;
    const activeUserRooms = [];
    const onlineContacts = [];
    const JoinedRooms = await chatRoomModel.find({
      $or: [{ user1: user }, { user2: user }],
    });

    await Promise.all(
      JoinedRooms.map(async (room) => {
        let contact = user == room.user2 ? room.user1 : room.user2;
        const isonline = await onlineUsers.isOnline(contact);
        if (isonline) {
          activeUserRooms.push(room._id);
          onlineContacts.push(contact);
        }
      })
    );
    res.status(200).send({
      success: true,
      message: "Active Rooms found Successfully",
      activeUserRooms,
      onlineContacts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while finding active rooms",
      error,
    });
  }
};

//GET  /search-contact/:contactId
export const searchContactContoller = async (req, res) => {
  const { contactId } = req.params;
  try {
    if (contactId == req.user._id) {
      res.status(404).send({
        success: false,
        message: "Not allowed to enter self ContactId",
      });
    }
    const contact = await userModel
      .findOne({ _id: contactId })
      .select("-password -DOB -email -phone -name -lastOnline");
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
