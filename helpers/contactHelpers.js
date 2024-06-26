import chatRoomModel from "../models/chatRoomModel.js";
import onlineUsers from "./onlineUsers.js";

export const contactDetailsFinder = async (user) => {
  try {
    const query = { $or: [{ user1: user }, { user2: user }] };
    let roomsData = await chatRoomModel
      .find(query)
      .select({ _id: 1, user1: 1, user2: 1, chats: { $slice: -1 } })
      .populate({ path: "user1", select: "_id username photo" })
      .populate({ path: "user2", select: "_id username photo" }); //roomsData:[{_id,user1,user2,chats:[{sender,text,media,timeSent}]}]
    if (roomsData.length == 0) {
      return [];
    }

    const filteredRoomData = roomsData.map(({ _id, user1, user2, chats }) => {
      return {
        _id,
        contact: user1._id == user ? user2 : user1,
        ...(chats.length && { chats: { sent: user==chats[0].sender, ...(chats[0].text ? { text: chats[0].text, iv: chats[0].iv } : { file: "File Shared" }), timeSent: chats[0].timeSent } })
      };
    });
    filteredRoomData.sort((a, b) => {
      const timeA = a.chats
        ? a.chats.timeSent
        : new Date(0);
      const timeB = b.chats
        ? b.chats.timeSent
        : new Date(0);
      return timeB - timeA;
    });
    return filteredRoomData;
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
};
