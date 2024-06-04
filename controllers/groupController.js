import { cloudinary } from "../config/cloudinary.js";
import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";

// POST /create-group
export const createGroupController = async (req, res) => {
  try {
    const { name, photo, description, members, createdAt } = req.body;
    const user = req.user._id;

    // checking entries
    if (!name) {
      return res
        .status(404)
        .send({ success: false, message: "Name is required" });
    }

    for (const member in members) {
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
    }

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
      createdAt: createdAt,
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
    const { group, users } = req.body;
    let membersToAdd = users;
    const foundGroup = await groupModel.findById(group).select("_id members");
    if (!foundGroup) {
      return res.status(404).send({
        success: false,
        message: "Group not found",
      });
    }

    const members = foundGroup.members;
    for (const user in users) {
      if (members.includes(user)) {
        membersToAdd = membersToAdd.filter((member) => member != user);
      }
    }
    if (!membersToAdd) {
      return res.status(304).send({
        success: true,
        message: "All members are already present in the group",
      });
    }

    const update = {
      $push: {
        members: {
          $each: membersToAdd,
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
    const { group, users } = req.body;

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
    if (!users) {
      return res.status(304).send({
        success: false,
        message: "No users to remove",
      });
    }

    const update = {
      $pull: {
        members: {
          $in: users,
        },
      },
    };
    await groupModel.findByIdAndUpdate(group, update, {
      runValidators: true,
    });

    const userUpdate = { $pull: { groups: foundGroup._id } };

    await Promise.all(
      users.map(async (member) => {
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

export const getAllGroupsController = async (req, res) => {
  try {
    const user = req.user._id;
    const groups = await userModel.findById(user).select("groups").populate(); // populate with group details
    if (!groups) {
      return res.status(201).send({
        success: true,
        message: "No groups found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Groups fetched successfully",
      groups,
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

export const getGroupLastMessageController = async (req, res) => {
  try {
    const { gid } = req.params;
    const userId = req.user._id;

    const { chats } = await groupModel
      .findById(gid, {
        chats: { $slice: -1 },
      })
      .select("chats -_id");

    let chat = null;
    if (chats.length) {
      chat = chats[0];
    }
    if (!chat) {
      res.status(200).send({
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
    res.status(200).send({
      success: true,
      message: "No messages found",
      messages: [],
    });
    return;
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
      .findById(group)
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

      res.status(200).send({
        success: true,
        message: "Messages found successfully",
        newMessagesCount,
        messages: formatMessages,
        totalPages: Math.ceil(totalMessages / chatsPerPage),
      });
    } else {
      res.status(200).send({
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
