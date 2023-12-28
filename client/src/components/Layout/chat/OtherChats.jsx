import React from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";

const OtherChats = ({ name, message, time, notify, active }) => {
  const msg = message.slice(0, 20);
  return (
    <Tilt
      tiltMaxAngleX={1}
      className={`otherchats ${active ? "otherchats-active" : ""}`}
    >
      <UserIcon size="40px" />
      <div className="otherchats-chat">
        <span className="otherchats-chat-name">{name}</span>
        <span className="otherchats-chat-message">{msg}...</span>
      </div>
      <div className="otherchats-info">
        <span className="otherchats-info-time">{time}</span>
        <span className="otherchats-info-notification">
          {notify ? <div className="notification"></div> : <div></div>}
        </span>
      </div>
    </Tilt>
  );
};

OtherChats.defaultProps = {
  active: false,
};
export default OtherChats;
