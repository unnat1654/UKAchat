import React, { useCallback } from "react";
import UserIcon from "../UserIcon";
import { IoCallSharp, IoVideocam} from "react-icons/io5";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { useActiveChat } from "../../context/activeChatContext";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext";
import peer from "../../services/peer";

const ChatNavbar = ({ callRoom,handleVoiceCall,handleVideoCall,useMyStream}) => {
  const [activeChat,setActiveChat]=useActiveChat();

  return (
    <div className="chat-navbar">
      {callRoom!=activeChat?.room &&
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
      {!callRoom && (
        <React.Fragment>
          <IoCallSharp onClick={handleVoiceCall} className="chat-navbar-phone" />
          <IoVideocam onClick={handleVideoCall} className="chat-navbar-videocall" />
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatNavbar;
