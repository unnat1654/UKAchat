import React from "react";

const MessageDisplay = ({ message, time, sent }) => {
  const sentTime = new Date(time);
  return (
    <div className={sent ? "message-box sent" : "message-box"}>
      <p className="message-box-message">{message}</p>
      <span className="message-box-time">
        {`${
          sentTime.getHours() % 12 ? sentTime.getHours() % 12 : 0
        }:${sentTime.getMinutes()} ${
          sentTime.getHours() / 12 < 1 ? "am" : "pm"
        }`}
      </span>
    </div>
  );
};

export default MessageDisplay;
