import React from "react";
import UserIcon from "../UserIcon";
import { IoCallSharp } from "react-icons/io5";
import { HiMiniVideoCamera } from "react-icons/hi2";

const ChatNavbar = (hideCallOptions) => {
  return (
    <div className="chat-navbar">
      {!hideCallOptions && <UserIcon classNameProp="chat-navbar-icon" />}

      <span>Unnat Kumar Agarwal</span>
      {!hideCallOptions && (
        <React.Fragment>
          <IoCallSharp className="chat-navbar-phone" />
          <HiMiniVideoCamera className="chat-navbar-videocall" />
        </React.Fragment>
      )}
    </div>
  );
};

export default ChatNavbar;
