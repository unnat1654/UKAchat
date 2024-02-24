import { contactIdFinder } from "../helpers/contactHelpers.js";
import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import mongoose from "mongoose";

// POST /create-room
export const createRoomController = async (req, res) => {
  try {
    const user1 = req.user._id;
    const user2 = req.body.contactId;
    const roomAlreadyExists = await chatRoomModel.findOne({
      $or: [
        { "user1":user1, "user2":user2 },
        { "user1": user2, "user2": user1 },
      ],
    });
    if (roomAlreadyExists) {
      res.status(200).send({
        success: true,
        message: "Room already exists",
        room: roomAlreadyExists._id,
      });
    }
    else{
    const room = await new chatRoomModel({
      user1: user1,
      user2: user2,
    }).save();
    res.status(201).send({
      success: true,
      message: "Room created successfully",
      room: room._id,
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

//PATCH  /stay-online
export const stayOnlineController = async (req, res) => {
  try {
    const user = req.user._id;
    const lastOnline = Date.now();
    await userModel.findByIdAndUpdate(user, {
      lastOnline: lastOnline,
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while setting user online",
      error,
    });
  }
};

//GET  /get-online/:contactId
export const getContactOnlineController = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await userModel.findById(contactId);
    if (Date.now() - contact.lastOnline < 6000) {
      res.status(200).send({
        success: true,
        online: true,
      });
    } else {
      res.status(200).send({
        success: true,
        online: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting contact online status",
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
  const userId = new mongoose.Types.ObjectId(user);
  console.log(user);
  try {
    const rooms = await chatModel.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { timeSent: -1 } },
      {
        $group: {
          _id: "$room",
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the output
          sender: 1, // Include sender field
          receiver: 1, // Include receiver field
        },
      },
      { $limit: 20 },
    ]);
    console.log(rooms);
    const contactDetailsArray = [];
    if (rooms?.length != 0) {
      contactDetailsArray = await contactIdFinder(rooms, user);
      // returing: {_id,username,photo:{securl_url,public_id}}
    }
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
  try {
    const rooms = await chatModel.aggregate([
      {
        $match: {
          $or: [{ sender: user }, { receiver: user }],
        },
      },
      { $sort: { timeSent: -1 } },
      { $group: { _id: "$room" } },
      { $skip: 20 },
    ]);
    const contactDetailsArray = await contactIdFinder(rooms, user);
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
