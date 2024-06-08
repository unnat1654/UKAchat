import React, { useCallback, useEffect, useState } from "react";
import OtherChats from "../../chat/OtherChats";
import { IoSearchOutline } from "react-icons/io5";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import { useActiveChat } from "../../../context/activeChatContext";
import Invites from "../../invite/Invites";
import IncomingCall from "../../call/IncomingCall";
import { useSocket } from "../../../context/socketContext";
import OtherGroups from "../../group/OtherGroups";
import { useIncomingCall } from "../../../hooks/IncomingCallHook";
import { useTabDetails } from "../../../hooks/TabDetailsHook";

const ChatMenu = ({ sideBarTab, setShowInviteBox, useMyCall }) => {
  const [searchInput, setSearchInput] = useState("");
  const socket = useSocket();
  const callInfo = useIncomingCall(socket);
  const [activeColor, setActiveColor] = useState("");
  const [auth, setAuth] = useAuth();
  const {
    handleSearch,
    contactDetailsArray,
    invitesArray,
    setInvitesArray,
    groupDetailsArray,
  } = useTabDetails(searchInput, sideBarTab, auth);

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 && event.target.name === "searchInput") {
      handleSearch();
    }
  };

  return (
    <div className="chatmenu">
      {sideBarTab == "chats" && (
        <React.Fragment>
          {callInfo.room && (
            <IncomingCall
              useCallInfo={[callInfo, setCallInfo]}
              useMyCall={useMyCall}
            />
          )}
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
                    room={c?._id}
                    name={c.contact.username}
                    photo={c.contact.photo?.secure_url}
                    notify={c.online}
                    id={c.contact._id}
                    active={c.contact._id === activeColor}
                    searched={contactDetailsArray.searchedNewUser}
                    setShowInviteBox={setShowInviteBox}
                    lastMessage={c.chats[0]}
                  />
                </div>
              ))}
            </React.Fragment>
          </div>
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
          {/* <Tilt className="chatmenu-search-bar">
            <input
              name="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="search for groups..."
              onKeyDown={handleKeyDown}
            />
            <span onClick={handleSearch}>
              <IoSearchOutline />
            </span>
          </Tilt> */}
          <div className="chatmenu-allchats">
            <React.Fragment>
              {groupDetailsArray?.map((group) => (
                <div
                  key={group._id}
                  onClick={() => {
                    setActiveColor(group._id);
                  }}
                >
                  <OtherGroups
                    name={group.name}
                    photo={group?.photo?.secure_url}
                    // notify={c.online}
                    id={group._id}
                    active={group._id === activeColor}
                  />
                </div>
              ))}
            </React.Fragment>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatMenu;
