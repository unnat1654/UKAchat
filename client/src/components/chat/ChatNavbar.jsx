import React, { useCallback } from "react";
import UserIcon from "../UserIcon";
import { IoCallSharp, IoVideocam } from "react-icons/io5";
import { useActiveChat } from "../../context/activeChatContext";

const ChatNavbar = ({ callRoom, sendCall }) => {
  const [activeChat, setActiveChat] = useActiveChat();

  return (
    <div className="chat-navbar">
      {(!callRoom.room || (callRoom.room != activeChat?.room || callRoom.type!="voice")) &&
        (activeChat?.photo ? (
          <img
            src={activeChat?.photo}
            className="chat-navbar-icon"
            alt="Unable to load profile picture"
          />
        ) : (
          <UserIcon classNameProp="chat-navbar-icon" />
        ))}

      <span>{activeChat?.username}</span>
      {!callRoom.room && (
        <React.Fragment>
          <IoCallSharp
            onClick={() => {
              sendCall("voice");
            }}
            className="chat-navbar-phone"
          />
          <IoVideocam
            onClick={() => {
              sendCall("video");
            }}
            className="chat-navbar-videocall"
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatNavbar;
