import { cloudinary } from "../config/cloudinary.js";
import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import mongoose from "mongoose";

const convertToObjectIdArray = (stringArray) => {
  return stringArray.map((str) => new mongoose.Types.ObjectId(str));
};

// POST /create-group
export const createGroupController = async (req, res) => {
  try {
    const { name, photo, description, members } = req.body;
    const user = req.user._id;

    // checking entries
    if (!name) {
      return res
        .status(404)
        .send({ success: false, message: "Name is required" });
    }

    await Promise.all(
      members.map(async (member) => {
        const roomAlready = await chatRoomModel
          .findOne({
            $or: [
              { user1: member, user2: user },
              { user2: member, user1: user },
            ],
          })
          .select("_id");
        if (!roomAlready) {
          return res.status(404).send({
            success: false,
            message: "Not all members are your contacts",
          });
        }
      })
    );

    // cloudinary return values
    let publicId;
    let secureUrl;

    if (photo) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        photo,
        {
          folder: "groupProfile",
        }
      );
      publicId = public_id;
      secureUrl = secure_url;
    }

    const groupMembers = [user, ...members];
    const group = new groupModel({
      name: name,
      photo: { secure_url: secureUrl, public_id: publicId },
      description: description,
      admin: [user],
      members: groupMembers,
    });
    const createdGroup = await group.save();

    const update = { $push: { groups: createdGroup._id } };

    await Promise.all(
      groupMembers.map(async (member) => {
        await userModel.findByIdAndUpdate(member, update);
      })
    );

    return res
      .status(201)
      .send({ success: true, message: "Group created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while creating group",
      error,
    });
  }
};

// POST /add-group-member
export const addGroupMemberController = async (req, res) => {
  try {
    // const userId = req.user._id;
    const { group, contacts } = req.body;
    let membersToAdd = contacts;
    const foundGroup = await groupModel.findById(group).select("_id members");
    if (!foundGroup) {
      return res.status(404).send({
        success: false,
        message: "Group not found",
      });
    }

    const groupMembers = foundGroup.members;

    for (const contact in contacts) {
      if (groupMembers.includes(contact)) {
        membersToAdd = membersToAdd.filter((member) => member != contact);
      }
    }
    if (!membersToAdd) {
      return res.status(304).send({
        success: true,
        message: "All members are already present in the group",
      });
    }

    const membersToAddObjectId = convertToObjectIdArray(membersToAdd);

    const update = {
      $push: {
        members: {
          $each: membersToAddObjectId,
        },
      },
    };
    await groupModel.findByIdAndUpdate(group, update, {
      runValidators: true,
    });

    const userUpdate = { $push: { groups: foundGroup._id } };

    await Promise.all(
      membersToAdd.map(async (member) => {
        await userModel.findByIdAndUpdate(member, userUpdate);
      })
    );

    return res.status(201).send({
      success: true,
      message: "New members added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while adding group member",
      error,
    });
  }
};

// POST /remove-group-member
export const removeGroupMemberController = async (req, res) => {
  try {
    const user = req.user._id;
    const { group, contacts } = req.body;

    const foundGroup = await groupModel.findById(group).select("_id admin");

    if (!foundGroup) {
      return res.status(404).send({
        success: false,
        message: "Group not found",
      });
    }
    if (!foundGroup.admin.includes(user)) {
      return res.status(403).send({
        success: false,
        message: "You need admin privilages to remove users",
      });
    }
    if (!contacts) {
      return res.status(304).send({
        success: false,
        message: "No users to remove",
      });
    }

    const membersToRemoveObjectId = convertToObjectIdArray(contacts);

    const update = {
      $pull: {
        members: {
          $in: membersToRemoveObjectId,
        },
      },
    };
    await groupModel.findByIdAndUpdate(group, update);

    const userUpdate = { $pull: { groups: foundGroup._id } };

    await Promise.all(
      contacts.map(async (member) => {
        await userModel.findByIdAndUpdate(member, userUpdate);
      })
    );

    return res.status(200).send({
      success: true,
      message: "members removed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while removing group members",
      error,
    });
  }
};

export const leaveGroupController = async (req, res) => {
  try {
    const user = req.user._id;
    const { group } = req.body;

    const foundGroup = await groupModel.findById(group);
    if (!foundGroup) {
      return res.status(404).send({
        success: false,
        message: "Group not found",
      });
    }
    if (!foundGroup.members.includes(user)) {
      return res.status(403).send({
        success: false,
        message: "Access Forbidden",
      });
    }
    const update = {
      $pull: {
        members: {
          $eq: user,
        },
      },
    };

    await groupModel.findByIdAndUpdate(group, update, {
      runValidators: true,
    });

    const userUpdate = { $pull: { groups: foundGroup._id } };
    await userModel.findByIdAndUpdate(user, userUpdate);

    return res.status(200).send({
      success: true,
      message: "Group left successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while leaving group",
      error,
    });
  }
};

// GET /get-group/:gid
export const getGroupController = async (req, res) => {
  try {
    const user = req.user._id;
    const group = req.params.gid;

    const groupAlready = await groupModel.findById(group);
    console.log(groupAlready);

    if (!groupAlready) {
      return res.status(404).send({
        success: false,
        message: "Group Not Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Group exists",
      group: groupAlready._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting group",
      error,
    });
  }
};

// GET /get-all-groups
export const getAllGroupsController = async (req, res) => {
  try {
    const user = req.user._id;
    const groups = await userModel.findById(user).select("groups").populate({
      path: "groups",
      select: "_id name description members admin photo",
    });
    if (!groups) {
      return res.status(201).send({
        success: true,
        message: "No groups found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Groups fetched successfully",
      groups: groups.groups,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while fetching groups",
      error,
    });
  }
};

// POST /send-group-message-api
export const sendGroupMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { group, text, doc, extension, timeSent } = req.body;
    let secureUrl, publicId;

    if (doc) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(doc, {
        resource_type: "auto",
        folder: "groupMedia",
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
            media: {
              secure_url: secureUrl,
              public_id: publicId,
              extension,
            },
          }),
          timeSent,
        },
      },
      $inc: { totalMessages: 1 },
    };

    await groupModel.findByIdAndUpdate(group, update, {
      runValidators: true,
    });
    return res.status(201).send({
      success: true,
      message: "Message Sent Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while Sending message",
      error,
    });
  }
};

// GET /get-group-last-message/:gid
export const getGroupLastMessageController = async (req, res) => {
  try {
    const { gid } = req.params;
    const userId = req.user._id;

    const { chats } = await groupModel.findById(gid, {
      chats: { $slice: -1 },
    });

    let chat = null;
    if (chats.length) {
      chat = chats[0];
    }
    if (!chat) {
      return res.status(200).send({
        success: false,
        message: "No Messages Found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Last message found successfully",
      lastMessageInfo: {
        sender: chat.sender,
        ...(chat.text && { lastMessage: chat.text }),
        ...(chat.media && !chat.text && { lastMessage: "File Shared" }),
        timeSent: chat.timeSent,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting last message from group.",
      error,
    });
  }
};

//GET  /get-group-messages?group=""&page=""&firstTime=""&lastTime=""
export const getGroupMessagesController = async (req, res) => {
  const { _id } = req.user;
  const group = req.query.group;
  const page = parseInt(req.query.page);
  if (page == 0) {
    return res.status(200).send({
      success: true,
      message: "No messages found",
      messages: [],
    });
  }
  const firstTimeInNum = parseInt(req.query.firstTime); //oldest local message time
  const lastTimeInNum = parseInt(req.query.lastTime); //last local stored message time
  let newMessagesCount = 0;

  try {
    const chatsPerPage = 100;
    const fromEndIndex = -(chatsPerPage * parseInt(page));
    let fetchfrom = fromEndIndex;
    let fetchTill = chatsPerPage;
    const { totalMessages } = await groupModel
      .findById(new mongoose.Types.ObjectId(group))
      .select("totalMessages");
    if (totalMessages == 0) {
      fetchfrom = 0;
      fetchTill = 0;
      res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount,
        messages: [],
      });
      return;
    } else if (totalMessages < -(fromEndIndex + 1)) {
      fetchfrom = -totalMessages;
      fetchTill = totalMessages - (page - 1) * chatsPerPage;
    }
    const { chats } = await groupModel.findOne(
      { _id: group },
      { chats: { $slice: [fetchfrom, fetchTill] } }
    );

    if (chats) {
      const formatMessages = [];
      if (1 == parseInt(page)) {
        for (let chat of chats) {
          let timeSent = new Date(chat.timeSent);
          if (timeSent.getTime() > lastTimeInNum) {
            newMessagesCount++;
          }
        }
      }
      for (let chat of chats) {
        if (0 == newMessagesCount && 1 == page) {
          let timeSent = new Date(chat.timeSent);
          if (timeSent.getTime() >= firstTimeInNum) {
            continue;
          }
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
          sender: chat.sender,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Messages found successfully",
        newMessagesCount,
        messages: formatMessages,
        totalPages: Math.ceil(totalMessages / chatsPerPage),
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "No messages found",
        newMessagesCount,
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
