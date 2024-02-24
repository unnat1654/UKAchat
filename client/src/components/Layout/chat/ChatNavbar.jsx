import React from "react";
import UserIcon from "../UserIcon";
import { IoCallSharp } from "react-icons/io5";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { useActiveChat } from "../../../context/activeChatContext";

const ChatNavbar = ({ isCall }) => {
  const [activeChat, setActiveChat] = useActiveChat();
  return (
    <div className="chat-navbar">
      {!isCall && (activeChat?.photo ? <img src={activeChat?.photo} className="chat-navbar-icon" alt="Unable to load profile picture"/> :<UserIcon classNameProp="chat-navbar-icon" />)}

      <span>{activeChat.username}</span>
      {!isCall && (
        <React.Fragment>
          <IoCallSharp className="chat-navbar-phone" />
          <HiMiniVideoCamera className="chat-navbar-videocall" />
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatNavbar;
