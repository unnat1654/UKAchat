import chatRoomModel from "../models/chatRoomModel.js";
import userModel from "../models/userModel.js";

export const contactIdFinder = async (roomArray, userId,limit) => {
  const contactIdArray = [];
  const contactIdArrayuser=[];
  const roomArrayLength=roomArray.length;
  roomArray.forEach((element) => {
    if (element.sender == userId) {
      contactIdArray.push({ _id: element.receiver });
      if(limit===null || roomArrayLength<limit){
      contactIdArrayuser.push({ user2: element.receiver });
      contactIdArrayuser.push({user1:element.receiver});
      }
    } else if (element.receiver == userId) {
      contactIdArray.push({ _id: element.sender });
      if(limit===null || roomArrayLength<limit){
      contactIdArrayuser.push({ user2: element.sender});
      contactIdArrayuser.push({user1:element.sender});
      }
    }
  });
  if(limit===null || roomArrayLength<=limit){
    const noMessageRooms=[];
    if(limit!==null){
      noMessageRooms=await chatRoomModel.find({$and:[{$or:[{user1:userId},{user2:userId}]},{$nor:contactIdArrayuser}]}).limit(limit-roomArrayLength).select("user1 user2 -_id");
    }
    else {
      noMessageRooms=await chatRoomModel.find({$and:[{$or:[{user1:userId},{user2:userId}]},{$nor:contactIdArrayuser}]}).select("user1 user2 -_id");
    }
    noMessageRooms.forEach((element) => {
      if(element.user1===userId){
        contactIdArray.push({_id:element.user2});
      }
      else if(element.user2===userId){
        contactIdArray.push({_id:element.user1});
      }
    });
  }
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
