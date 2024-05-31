import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";
import onlineUsers from "./onlineUsers.js";

export const contactDetailsFinder = async (user, limit) => {
  try {
    const query = { $or: [{ user1: user }, { user2: user }] };
    let roomsData = await chatRoomModel.find(query, { chats: { $slice: -1 } }); //roomsData:[{_id,user1,user2,chats:[{sender,text,media,timeSent}]}]
    if (roomsData.length == 0) {
      return [];
    }
    roomsData.sort((a, b) => {
      const timeA = a.chats.length
        ? a.chats[a.chats.length - 1]?.timeSent
        : new Date(0);
      const timeB = b.chats.length
        ? b.chats[b.chats.length - 1]?.timeSent
        : new Date(0);
      return timeB - timeA;
    });
    let numberOfContacts = roomsData.length;
    if (limit) {
      numberOfContacts = roomsData.length > limit ? limit : roomsData.length;
    }
    const contacts = [];
    for (let i = 0; i < numberOfContacts; i++) {
      if (roomsData[i].user1 == user) {
        contacts.push(roomsData[i].user2);
        continue;
      }
      contacts.push(roomsData[i].user1);
    }
    // const contactDetailsArray = await userModel.find(
    //   { _id: { $in: contacts } },
    //   { username: 1, _id: 1, photo: 1 }
    // );

    const contactDetailsArray = await userModel.aggregate([
      { $match: { _id: { $in: contacts } } }, // Filter by IDs in the contacts array
      {
        $addFields: {
          __order: { $indexOfArray: [contacts, "$_id"] },
        },
      },
      { $sort: { __order: 1 } }, // Sort based on the order in the contacts array
      {
        $project: {
          _id: 1,
          username: 1,
          photo: 1,
        },
      },
    ]);
    //sort the contactDetailsArray according to the sorted contacts array
    // contactDetailsArray.sort((a, b) => {
    //   const indexA = contacts.indexOf(a._id);
    //   const indexB = contacts.indexOf(b._id);
    //   return indexA - indexB;
    // });
    return contactDetailsArray;
  } catch (error) {
    console.log(error);
    throw new Error(
      "Error occured in contactHelpers/contactDetailsFinder function"
    );
  }
};

export const findOnlineContacts = async (userId) => {
  const activeUserRooms = [];
  const onlineContacts = [];
  try {
    const JoinedRooms = await chatRoomModel.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    await Promise.all(
      JoinedRooms.map(async (room) => {
        let contactId = userId == room.user2 ? room.user1 : room.user2;
        const isonline = await onlineUsers.isOnline(contactId);
        if (isonline) {
          activeUserRooms.push(room._id.toString());
          onlineContacts.push(contactId.toString());
        }
      })
    );
  } catch (e) { }
  return { activeUserRooms, onlineContacts };
}