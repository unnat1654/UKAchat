import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";

export const contactIdFinder = async (roomArray, userId) => {
  const contactIdArray = [];
  roomArray.forEach((element) => {
    if (element.sender == userId) {
      contactIdArray.push({ _id: element.receiver });
    } else if (element.receiver == userId) {
      contactIdArray.push({ _id: element.sender });
    }
  });
  const contactDetailsArray = await userModel.find(
    { $or: contactIdArray },
    { DOB: -1, name: -1, password: -1, phone: -1, email: -1, lastOnline: -1}
  );
  if (contactIdArray.length == 0) {
    throw { message: "ContactId array is empty" };
  }
  const sortedContactDetailsArray = [];
  if (contactDetailsArray.length == contactIdArray.length) {
    contactIdArray.forEach((element) => {
      for (let i = 0; i < contactDetailsArray.length; i++) {
        if (element == contactDetailsArray._id) {
          sortedContactDetailsArray.push(contactDetailsArray[i]);
          contactDetailsArray.splice(i, 1); //remove the item from contactDetailsArray
        }
      }
    });
    if (sortedContactDetailsArray.length == 0) {
      throw { message: "sorted Contact Details is empty" };
    } else {
      return sortedContactDetailsArray;
    }
  } else {
    throw {
      message: "Not all users are found",
      contactDetailsArray,
      contactIdArray,
    };
  }
};
