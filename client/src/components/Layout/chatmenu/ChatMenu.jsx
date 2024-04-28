import React, { useCallback, useEffect, useState } from "react";
import OtherChats from "../../chat/OtherChats";
import { IoSearchOutline } from "react-icons/io5";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import { useActiveChat } from "../../../context/activeChatContext";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import Invites from "../../invite/Invites";
import LoadingScreen from "../../loaders/LoadingScreen"
import peer from "../../../services/peer";
import IncomingCall from "../../call/IncomingCall";
import { useSocket } from "../../../context/socketContext";

const ChatMenu = ({ sideBarTab, setShowInviteBox, useMyStream }) => {
  const [searchInput, setSearchInput] = useState("");
  const [callerInfo, setCallerInfo] = useState({room:"abc",username:"abcusername",photo:"",offer:"abcoffer",type:"voice"});
  const [activeColor, setActiveColor] = useState("");
  const [invitesArray, setInvitesArray] = useState([]);
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const socket=useSocket();

  const handleIncomingVoiceCall = useCallback(
    async ({ room, offer, username, photo }) => {
      if (callerInfo.username != "") return;
      setCallerInfo({username,photo,offer,room,type:"voice"});
    },
    [auth]
  );

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

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 && event.target.name === "searchInput") {
      handleSearch();
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

  useEffect(() => {
    if(socket){
    socket.on("incoming-call:voice", handleIncomingVoiceCall);
    return () => {
      socket.off("incoming-call:voice", handleIncomingVoiceCall);
    };
  }
  }, [socket, handleIncomingVoiceCall]);

  return (
    <div className="chatmenu">
      {sideBarTab == "chats" && (
        <React.Fragment>
          {callerInfo.room && <IncomingCall callerInfo={callerInfo} setCallerInfo={setCallerInfo} useMyStream={useMyStream}/>}
          <Tilt className="chatmenu-search-bar">
            <input
              name="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="search for chat..."
              onKeyDown={handleKeyDown}
            />
            <span onClick={handleSearch}>
              <IoSearchOutline />
            </span>
          </Tilt>
          {/* {JSON.stringify(activeChat, null, "\t")} */}

          <div className="chatmenu-allchats">
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
          </div>
          {/* {JSON.stringify(activeChat, null, "\t")} */}
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

      {sideBarTab == "groups" && (
        <React.Fragment>
          <LoadingScreen></LoadingScreen>
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatMenu;
