import requestModel from "../models/requestModel.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST   /send-request
export const sendRequestController = async (req, res) => {
  const { sentToId, sendType, timeSent } = req.body;
  const user = req.user._id;
  if ("chat" === sendType) {
    try {
      const roomAlready = await chatRoomModel.findOne({ $or: [{ user1: sentToId, user2: user }, { user2: sentToId, user1: user }] });
      if (roomAlready) {
        return res.status(404).send({
          success: false,
          message: "The invited user is already connected.",
        });
      }
      const invitesToContact = await requestModel.find({
        recieverId: sentToId,
      });
      const UserInvitedAlready = await requestModel.findOne({
        $or: [
          { recieverId: sentToId, senderUserId: user },
          { senderUserId: sentToId, recieverId: user },
        ],
      });
      if (UserInvitedAlready) {
        return res.status(200).send({
          success: false,
          message: "Invite already shared between both users",
        });
      }
      if (invitesToContact >= 50) {
        return res.status(200).send({
          success: false,
          message: "Invited user has too many pending invites",
        });
      }
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

    } catch (error) {
      console.log(error);
      res.status(500).send({
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
      return res.status(200).send({
        success: true,
        message: "No pending invites",
      });
    }
    if (invites.length == 50) {
      return res.status(200).send({
        success: true,
        message: "Maximum possible invites reached",
        invites,
      });
    }
    res.status(200).send({
      success: true,
      message: "Invites fetched successfully",
      invites,
    });
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
    const invite = await requestModel.findOneAndDelete({
      senderUserId: senderId,
      recieverId: user,
    });
    if (!invite) {
      return res.status(404).send({
        success: false,
        message: "No invite Found",
      });
    }
    if (isAccepted === false) {
      return res.status(200).send({
        success: true,
        message: "Invite Rejected",
        body: invite,
      });
    }
    const room = new chatRoomModel({
      user1: user,
      user2: senderId,
    });
    await room.save();
    res.status(200).send({
      success: true,
      message: "Invite accepted successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while responding to invite",
      error,
    });
  }
};
