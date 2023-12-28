import React from "react";

const Message = ({ message, time, sent }) => {
  return (
    <div className={sent ? `message-box sent` : `message-box`}>
      <p className="message-box-message">{message}</p>
      <span className="message-box-time">{time}</span>
    </div>
  );
};

export default Message;
