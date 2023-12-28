import { contactIdFinder } from "../helpers/contactHelpers.js";
import chatRoomModel from "../models/chatRoomModel.js";

export const createRoomController = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const roomAlreadyExists = await chatRoomModel.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 },
      ],
    });
    if (roomAlreadyExists) {
      res.status(200).send({
        success: false,
        message: "Room already exists",
        room: roomAlreadyExists._id,
      });
    }
    const room = await new chatRoomModel({
      user1: user1,
      user2: user2,
    }).save();
    res.status(201).send({
      success: true,
      message: "Room created successfully",
      room: room._id,
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

//get the 20 users who last sent a message to user. (sorted in descending order according to recent message)
export const getContactsController = async (req, res) => {
  const user = req.user._id;

  try {
    const rooms = await chatModel.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(user) },
            { receiver: mongoose.Types.ObjectId(user) },
          ],
        },
      },
      { $sort: { timeSent: -1 } },
      { $group: { _id: "$room" } },
      { $limit: 20 },
    ]);
    const contactDetailsArray = await contactIdFinder(rooms, user);
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

export const getAllContactsController = async (req, res) => {
  const user = req.user._id;
  try {
    const rooms = await chatModel.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(user) },
            { receiver: mongoose.Types.ObjectId(user) },
          ],
        },
      },
      { $sort: { timeSent: -1 } },
      { $group: { _id: "$room" } },
      { $skip: 20 },
    ]);
    const contactDetailsArray = await contactIdFinder(rooms, user);
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
