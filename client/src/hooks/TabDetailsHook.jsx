import { useState, useEffect } from "react";
import axios from "axios";
import { deriveSharedkey } from "../functions/encryptionFunctions";
import { getRoomLSMessages } from "../functions/localStorageFunction";

export const useTabDetails = (
  searchInput,
  sideBarTab,
  auth,
  setContactDetailsArray,
  setShowInviteBox,
  onlineUsers
) => {
  const [invitesArray, setInvitesArray] = useState([]);

  const handleSearch = async () => {
    try {
      if (searchInput == "") {
        getContactDetails();
        setShowInviteBox((prev) => ({ ...prev, isShow: false }));
        return;
      }
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/search-contact/${searchInput}`
      );
      if (data?.success) {
        setContactDetailsArray({
          searchedNewUser: true,
          detailsArray: [data?.contactDetails],
        });
      } else {
        console.log(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getContactDetails = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-all-contacts`
      );

      if (data?.success) {
        data?.contactDetailsArray.forEach((roomDetails,index,array)=>{
          const lsRoomMessages=getRoomLSMessages(roomDetails._id,true);
          array[index]={
            ...roomDetails,
            online: onlineUsers.includes(roomDetails.contact._id),
            ...(lsRoomMessages.length && {chats:{
              sent:lsRoomMessages.at(-1).sent,
              timeSent:lsRoomMessages.at(-1).timeSent,
              ...(lsRoomMessages.at(-1).text? {text:lsRoomMessages.at(-1).text,iv:lsRoomMessages.at(-1).iv}:{file:"file shared"})
            }})
          }
        });
        setContactDetailsArray({
          searchedNewUser: false,
          detailsArray: data?.contactDetailsArray,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPublicKeys = async () => {
    try {
      const userKeysObject = JSON.parse(localStorage.getItem(`userKeys`));

      const roomParams = new URLSearchParams();
      let needRequest = false;
      Object.entries(userKeysObject).forEach(([roomId, roomKeys]) => {
        if (roomKeys.privateKey && !roomKeys.sharedKey) {
          roomParams.append("rooms", roomId);
          needRequest = true;
        }
      });
      if (!needRequest) return;

      const {
        data: { success, contactPublicKeys },
      } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-public-key`,
        { params: roomParams }
      );
      if (!success || !contactPublicKeys) return;

      for (const [roomId, roomKeys] of Object.entries(userKeysObject)) {
        if (contactPublicKeys[roomId]) {
          userKeysObject[roomId].sharedKey = await deriveSharedkey(
            roomKeys.privateKey,
            contactPublicKeys[roomId]
          );
        }
      }
      localStorage.setItem(`userKeys`, JSON.stringify(userKeysObject));
    } catch (error) {
      console.log(error);
    }
  };

  //get contacts and set that user is online
  const getInvites = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/request/show-requests`
      );
      if (data?.success) {
        setInvitesArray(data?.invites);
      }
    } catch (error) {
      console.log(error);
    }
  };



  useEffect(() => {
    if (auth?.token) {
      getInvites();
      getContactDetails();
      fetchPublicKeys();
    }
  }, [auth?.token, onlineUsers]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }
    if (sideBarTab == "invites") {
      getInvites();
    }
    if (sideBarTab == "chats") {
      getContactDetails();
    }
  }, [sideBarTab]);

  useEffect(() => {
    if (auth?.token) {
      getContactDetails();
      fetchPublicKeys();
    }
  }, [invitesArray.length]);

  return {
    handleSearch,
    invitesArray,
    setInvitesArray,
  };
};
