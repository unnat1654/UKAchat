import userModel from "../models/userModel.js";
import requestModel from "../models/requestModel.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST   /send-request
export const sendRequestController = async (req, res) => {
  const { sentToId, sendType, timeSent } = req.body;
  const user = req.user._id;
  if ("chat" === sendType) {
    try {
      const reciever = await userModel.findById({ _id: sentToId });
      if (!reciever) {
        res.status(404).send({
          success: false,
          message: "User not found among registered Users",
        });
      }
      const invitesToContact = await requestModel.find({
        recieverId: sentToId,
      });
      const UserInvitedAlready = await requestModel.find({
        $or: [
          { recieverId: sentToId, senderUserId: user },
          { senderUserId: sentToId, recieverId: user },
        ],
      });
      if (UserInvitedAlready > 0) {
        res.status(200).send({
          success: false,
          message: "Invite already shared between both users",
        });
      } else if (invitesToContact >= 50) {
        res.status(200).send({
          success: false,
          message: "Invited user has too many pending invites",
        });
      } else {
        const invite = new requestModel({
          senderUserId: user,
          recieverId: sentToId,
          timeSent: timeSent,
        });
        await invite.save();
        res.status(201).send({
          success: true,
          message: "Invite sent successfully",
        });
      }
    } catch (error) {
      console.log(error);
      req.status(500).send({
        success: false,
        message: "Error while sending request",
        error,
      });
    }
  }
};

//GET  /show-requests
export const showRequestsController = async (req, res) => {
  const user = req.user._id;
  try {
    const invites = await requestModel
      .find({
        recieverId: user,
      })
      .sort({ timeSent: -1 })
      .populate({ path: "senderUserId", select: "username photo" });
    if (!invites) {
      res.status(200).send({
        success: true,
        message: "No pending invites",
      });
    } else if (invites.length == 50) {
      res.status(200).send({
        success: true,
        message: "Maximum possible invites reached",
        invites,
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Invites fetched successfully",
        invites,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching requests",
      error,
    });
  }
};

//DELETE  /handle-requests
export const handleRequestController = async (req, res) => {
  const user = req.user._id;
  const { senderId, senderType, isAccepted } = req.body;
  try {
    const invite = await requestModel.find({
      senderUserId: senderId,
      recieverId: user,
    });

    console.log(senderId);
    console.log(invite);
    if (!invite) {
      res.status(404).send({
        success: false,
        message: "No invite Found",
      });
    }
    if (!isAccepted) {
      res.status(200).send({
        success: true,
        message: "Invite Rejected",
        body: req.body,
      });
    } else {
      const room = new chatRoomModel({
        user1: user,
        user2: senderId,
      });
      await room.save();
      res.status(200).send({
        success: true,
        message: "Invite accepted successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while responding to invite",
      error,
    });
  }
};
