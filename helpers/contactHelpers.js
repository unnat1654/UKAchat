import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";

export const contactIdFinder = async (roomArray, userId) => {
  const roomDetails = await chatRoomModel.find({ $or: roomArray });
  const ContactIdArray = [];
  roomDetails.forEach((element) => {
    if (element.user1 == userID) {
      ContactIdArray.push({ _id: element.user2 });
    } else if (element.user2 == userId) {
      ContactIdArray.push({ _id: element.user1 });
    }
  });
  const ContactDetailsArray = await userModel.find(
    { $or: ContactIdArray },
    { DOB: -1, name: -1, password: -1 }
  );
  return ContactDetailsArray;
};
