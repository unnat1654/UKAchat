import React, { useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useActiveGroup } from "../../context/activeGroupContext";
import { convertTimeTo12 } from "../../functions/timeFunction";
import {
  getLSMsgTimeRange,
  getRoomLSMessages,
} from "../../functions/localStorageFunction";

const OtherGroups = ({ name, photo, id, active }) => {
  const [activeGroup, setActiveGroup] = useActiveGroup();
  const [lastMessageInfo, setLastMessageInfo] = useState({});
  const getLastMessageInfo = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_SERVER}/group/get-group-last-message/${id}`
    );
    setLastMessageInfo(data?.lastMessageInfo);
  };
  const handleClick = async () => {
    try {
      if (activeGroup?.id != id) {
        const groupResponse = await axios.get(
          `${import.meta.env.VITE_SERVER}/group/get-group/${id}`
        );
        if (groupResponse?.data?.success) {
          const group = groupResponse?.data?.group;
          const [firstTime, lastTime] = getLSMsgTimeRange(group);
          const messagesResponse = await axios.get(
            `${
              import.meta.env.VITE_SERVER
            }/group/get-group-messages?group=${group}&page=1${
              firstTime ? `&firstTime=${firstTime}` : ""
            }${lastTime ? `&lastTime=${lastTime}` : ""}`
          );
          const recievedMessages = messagesResponse?.data?.messages;
          if (messagesResponse?.data?.success) {
            const msgInLS = getRoomLSMessages(
              group,
              0 == messagesResponse.data.newMessagesCount
            ); // if new messages are found then getRoomLSMessages are not required
            setActiveGroup({
              c_id: id,
              group,
              messages: [
                ...(recievedMessages ? recievedMessages : []),
                ...msgInLS,
              ],
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getLastMessageInfo();
  }, []);
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
            {lastMessageInfo?.lastMessage?.slice(0, 20)}
            {lastMessageInfo?.lastMessage?.length > 20 ? "..." : ""}
          </span>
        </div>
        <div className="otherchats-info">
          <span className="otherchats-info-time">
            {lastMessageInfo?.timeSent
              ? convertTimeTo12(lastMessageInfo?.timeSent)
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
