import { useState, useEffect } from "react";
import axios from "axios";
import { useContactDetailsArray } from "../context/ContactDetailsContext";
import { useGroupDetailsArray } from "../context/groupDetailsContext";
import { deriveSharedkey } from "../functions/encryptionFunctions";

export const useTabDetails = (searchInput, sideBarTab, auth) => {
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [invitesArray, setInvitesArray] = useState([]);
  const [groupDetailsArray, setGroupDetailsArray] = useGroupDetailsArray();

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
      const contactDetails = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-all-contacts`
      );
      if (contactDetails?.data?.success) {
        setContactDetailsArray({
          searchedNewUser: false,
          detailsArray: contactDetails?.data?.contactDetailsArray,
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
      Object.entries(userKeysObject).map(([roomId, roomKeys]) => {
        if (roomKeys.privateKey && !roomKeys.sharedKey) {
          roomParams.append("users", roomId);
          needRequest = true;
        }
      });
      if (!needRequest) return;

      const {
        data: { success, contactPublicKeys },
      } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-public-key`,
        roomParams
      );
      if (!success || !contactPublicKeys) return;

      Object.entries(userKeysObject).map(([roomId, roomKeys]) => {
        if (contactPublicKeys[roomId]) {
          userKeysObject[roomId].sharedKey = deriveSharedkey(
            roomKeys.privateKey,
            contactPublicKeys[roomId]
          );
        }
      });

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

  const getGroupDetails = async () => {
    try {
      const groupDetails = await axios.get(
        `${import.meta.env.VITE_SERVER}/group/get-all-groups`
      );
      console.log(groupDetails?.data.groups);
      if (groupDetails?.data?.success) {
        setGroupDetailsArray(groupDetails?.data?.groups);
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
      getGroupDetails();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token && sideBarTab == "invites") {
      getInvites();
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
    contactDetailsArray,
    invitesArray,
    setInvitesArray,
    groupDetailsArray,
  };
};
