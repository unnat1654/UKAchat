import React from "react";
import { convertTimeTo12 } from "../../../functions/timeFunction";

const MessageDisplay = ({ message, time, sent }) => {

  return (
    <div className={sent ? "message-box sent" : "message-box"}>
      <p className="message-box-message">{message}</p>
      <span className="message-box-time">
        {convertTimeTo12(time)}
      </span>
    </div>
  );
};

export default MessageDisplay;
