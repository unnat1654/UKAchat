import React, { useEffect, useState } from "react";
import OtherChats from "../chat/OtherChats";
import { IoSearchOutline } from "react-icons/io5";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import { useActiveChat } from "../../../context/activeChatContext";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import Invites from "../invite/Invites";

const ChatMenu = ({ sideBarTab, setShowInviteBox }) => {
  const [searchInput, setSearchInput] = useState("");
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const [activeColor, setActiveColor] = useState("");
  const [invitesArray, setInvitesArray] = useState([]);

  const getContactDetails = async () => {
    try {
      const contactDetails = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-contacts`
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

  //on component mount get contacts and set that user is online
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
    }
  }, [invitesArray.length]);

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
          detailsArray: [data?.contact],
        });
      } else {
        console.log(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="chatmenu">
      {sideBarTab == "chats" && (
        <React.Fragment>
          <Tilt className="chatmenu-search-bar">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="search for chat..."
            />
            <span onClick={handleSearch}>
              <IoSearchOutline />
            </span>
          </Tilt>
          {JSON.stringify(activeChat,null,"\t")}

          <React.Fragment>
            {contactDetailsArray?.detailsArray.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  setActiveColor(c._id);
                }}
              >
                <OtherChats
                  name={c.username}
                  photo={c?.photo?.secure_url}
                  notify={c.online}
                  id={c._id}
                  active={c._id === activeColor}
                  searched={contactDetailsArray.searchedNewUser}
                  setShowInviteBox={setShowInviteBox}
                />
              </div>
            ))}
          </React.Fragment>
        </React.Fragment>
      )}
      {sideBarTab == "invites" && (
        <React.Fragment>
          {invitesArray.map((invite) => (
            <Invites
              key={invite._id}
              photo={invite?.senderUserId?.photo?.secure_url}
              sender={invite?.senderUserId?.username}
              id={invite?.senderUserId}
              setInvitesArray={setInvitesArray}
            ></Invites>
          ))}
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatMenu;
