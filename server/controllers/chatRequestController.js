import requestModel from "../models/requestModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import queryCache from "../helpers/queryCacheHelpers.js";
import { randomUUID } from "crypto";

//POST   /send-request
export const sendRequestController = async (req, res) => {
  try {
    const { sentToId, senderPublicKey, timeSent } = req.body;
    const user = req.user._id;
    if (!senderPublicKey) {
      return res.status(404).send({
        success: false,
        message: "Sender Public key missing.",
      });
    }
    let roomAlready = await queryCache.get(
      `chatRoomModel-findOne-nochats:${user},${sentToId}`
    );
    if (!roomAlready) {
      roomAlready = await chatRoomModel
        .findOne({
          $or: [
            { user1: sentToId, user2: user },
            { user2: sentToId, user1: user },
          ],
        })
        .select("_id user1 user2");
      await queryCache.set(
        `chatRoomModel-findOne-nochats:${user},${sentToId}`,
        roomAlready,
        300
      );
    }

    if (roomAlready) {
      return res.status(404).send({
        success: false,
        message: "The invited user is already connected.",
      });
    }

    let invitesToContact = await queryCache.get(
      `requestModel-find:${sentToId}`
    );
    if (!invitesToContact) {
      invitesToContact = await requestModel
        .find({
          recieverId: sentToId,
        })
        .select("-_id senderUserId recieverId");
      if (invitesToContact.length) {
        await queryCache.set(
          `requestModel-find:${sentToId}`,
          invitesToContact,
          20
        );
      }
    }

    const UserInvitedAlready = invitesToContact.filter(
      (invite) => invite.senderUserId == user || invite.recieverId == user
    );

    if (UserInvitedAlready.length || invitesToContact >= 50) {
      return res.status(409).send({
        success: false,
        message:
          UserInvitedAlready.length > 0
            ? "Invite shared already"
            : "Invited user has too many pending invites",
      });
    }

    const invite = new requestModel({
      senderUserId: user,
      senderPublicKey,
      recieverId: sentToId,
      roomId: randomUUID(),
      timeSent: timeSent,
    });
    await invite.save();

    res.status(201).send({
      success: true,
      message: "Invite sent successfully",
      roomId: invite.roomId,
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
      message:
        invites.length === 50
          ? "Maximum possible invites reached"
          : "Invites fetched successfully",
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

//POST  /generate-qr-invite
export const generateQrInviteController = async (req, res) => {
  try {
    const user = req.user._id;
    const { senderPublicKey } = req.body;
    if (!senderPublicKey) {
      return res.status(404).send({
        success: false,
        message: "Sender Public key missing.",
      });
    }
    await requestModel.deleteMany({ senderUserId: user, recieverId: null });
    const invite = new requestModel({
      senderUserId: user,
      senderPublicKey,
      roomId: randomUUID(),
      timeSent: Date.now(),
    });
    await invite.save();
    res.status(201).send({
      success: true,
      message: "Invite generated successfully",
      inviteId: invite._id,
      roomId: invite.roomId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while generating invite",
      error,
    });
  }
};

//POST  /qr-accept
export const qrAcceptController = async (req, res) => {
  try {
    const user = req.user._id;
    const { inviteId, userPublicKey } = req.body;
    if (!inviteId || !userPublicKey) {
      return res.status(404).send({
        success: false,
        message: "Invite Id or public key missing",
      });
    }
    const invite = await requestModel.findOneAndDelete({
      _id: inviteId,
      recieverId: null,
    });
    if (!invite) {
      return res.status(404).send({
        success: false,
        message: "Invite not found or already used",
      });
    }
    if (invite.senderUserId.equals(user)) {
      return res.status(400).send({
        success: false,
        message: "Cannot accept your own invite",
      });
    }
    const existing = await chatRoomModel
      .findOne({
        $or: [
          { user1: invite.senderUserId, user2: user },
          { user1: user, user2: invite.senderUserId },
        ],
      })
      .select("_id");
    if (existing) {
      return res.status(409).send({
        success: false,
        message: "Already connected with this user",
      });
    }
    const room = new chatRoomModel({
      _id: invite.roomId,
      user1: user,
      user1PublicKey: userPublicKey,
      user2: invite.senderUserId,
      user2PublicKey: invite.senderPublicKey,
    });
    await room.save();
    res.status(200).send({
      success: true,
      message: "Invite accepted successfully",
      roomId: room._id,
      contactPublicKey: invite.senderPublicKey,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while accepting invite",
      error,
    });
  }
};

//DELETE  /handle-requests
export const handleRequestController = async (req, res) => {
  try {
    const user = req.user._id;
    const { senderId, isAccepted, userPublicKey } = req.body;
    if (!senderId) {
      return res.status(404).send({
        success: false,
        message: "senderId Missing",
      });
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
    if (!isAccepted) {
      //isAccepted is undefined or null
      return res.status(404).send({
        success: false,
        message: "Acceptence missing?",
      });
    }
    const room = new chatRoomModel({
      _id: invite.roomId,
      user1: user,
      user1PublicKey: userPublicKey,
      user2: senderId,
      user2PublicKey: invite.senderPublicKey,
    });
    await room.save();
    res.status(200).send({
      success: true,
      message: "Invite accepted successfully",
      roomId: room._id,
      contactPublicKey: invite.senderPublicKey,
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
