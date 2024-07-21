import React, { useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useActiveGroup } from "../../context/activeGroupContext";
import { convertTimeTo12 } from "../../functions/timeFunction";

const OtherGroups = ({ name, photo, id, active, lastMessage }) => {
  const [activeGroup, setActiveGroup] = useActiveGroup();
  const handleClick = async () => {
    try {
      if (activeGroup?.id != id) {
        const groupResponse = await axios.get(
          `${import.meta.env.VITE_SERVER}/group/get-group/${id}`
        );
        console.log(groupResponse.data);
        if (groupResponse?.data?.success) {
          const group = groupResponse?.data?.group;
          const messagesResponse = await axios.get(
            `${
              import.meta.env.VITE_SERVER
            }/group/get-group-messages?group=${group}&page=1&firstTime=""&lastTime=""`
          );
          console.log(messagesResponse.data);
          const recievedMessages = messagesResponse?.data?.messages;
          if (messagesResponse?.data?.success) {
            setActiveGroup({
              group: groupResponse.data.group,
              messages: [...(recievedMessages ? recievedMessages : [])],
              user: groupResponse.data.user,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div onClick={handleClick}>
      <Tilt
        tiltMaxAngleX={1}
        className={`otherchats ${active ? "otherchats-active" : ""}`}
      >
        {photo ? (
          <img src={photo} className="otherchats-dp" alt="" />
        ) : (
          <UserIcon size="45px" />
        )}
        <div className="otherchats-chat">
          <span className="otherchats-chat-name">{name}</span>
          <span className="otherchats-chat-message">
            {lastMessage.sender != id && "You: "}
            {lastMessage.media && "File Shared"}
            {lastMessage?.text?.slice(0, 20)}
            {lastMessage?.text?.length > 20 ? "..." : ""}
          </span>
        </div>
        <div className="otherchats-info">
          <span className="otherchats-info-time">
            {lastMessage?.timeSent
              ? convertTimeTo12(lastMessage?.timeSent)
              : ""}
          </span>
          {/* <span className="otherchats-info-notification">
            {notify ? <div className="notification"></div> : <div></div>}
          </span> */}
        </div>
      </Tilt>
    </div>
  );
};

OtherGroups.defaultProps = {
  active: false,
};
export default OtherGroups;
