import requestModel from "../models/requestModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import queryCache from "../helpers/queryCacheHelpers.js";

//POST   /send-request
export const sendRequestController = async (req, res) => {
  try {
    const { sentToId, timeSent } = req.body;
    const user = req.user._id;

    let roomAlready = await queryCache.get(`chatRoomModel-findOne-nochats:${user},${sentToId}`);
    if (!roomAlready) {
      roomAlready = await chatRoomModel.findOne({ $or: [{ user1: sentToId, user2: user }, { user2: sentToId, user1: user }] }).select("_id user1 user2");
      await queryCache.set(`chatRoomModel-findOne-nochats:${user},${sentToId}`, roomAlready, 300);
    }
    
    if (roomAlready) {
      return res.status(404).send({
        success: false,
        message: "The invited user is already connected.",
      });
    }

    let invitesToContact = await queryCache.get(`requestModel-find:${sentToId}`);
    if (!invitesToContact) {
      invitesToContact = await requestModel.find({
        recieverId: sentToId,
      }).select("-_id senderUserId recieverId");
      if (invitesToContact.length) {
        await queryCache.set(`requestModel-find:${sentToId}`, invitesToContact, 20);
      }
    }

    const UserInvitedAlready = invitesToContact.filter(invite => invite.senderUserId == user || invite.recieverId == user);


    if (UserInvitedAlready.length || invitesToContact >= 50) {
      return res.status(409).send({
        success: false,
        message: UserInvitedAlready.length > 0 ? "Invite shared already" : "Invited user has too many pending invites",
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

};

//GET  /show-requests
export const showRequestsController = async (req, res) => {
  try {
    const user = req.user._id;

    let invites = await queryCache.get(`requestModel-find-sorted:${user}`);
    if (!invites) {
      invites = await requestModel
        .find({
          recieverId: user,
        })
        .sort({ timeSent: -1 })
        .select("-recieverId")
        .populate({ path: "senderUserId", select: "_id username photo" });
      await queryCache.set(`requestModel-find-sorted:${user}`, invites, 10);
    }

    if (!invites) {
      return res.status(200).send({
        success: true,
        message: "No pending invites",
      });
    }

    res.status(200).send({
      success: true,
      message: invites.length === 50 ? "Maximum possible invites reached" : "Invites fetched successfully",
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
  try {
    const user = req.user._id;
    const { senderId, isAccepted } = req.body;
    if (!senderId) {
      return res.status(404).send({
        success: false,
        message: "senderId Missing"
      })
    }
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
      });
    }
    if (!isAccepted) {//isAccepted is undefined or null
      return res.status(404).send({
        success: false,
        message: "Acceptence missing?",
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
