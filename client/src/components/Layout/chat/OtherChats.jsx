import React, { useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useActiveChat } from "../../../context/activeChatContext";

const OtherChats = ({
  name,
  photo,
  notify,
  id,
  active,
  searched,
  setShowInviteBox,
}) => {
  const [activeChat, setActiveChat] = useActiveChat();
  const [lastMessageInfo, setLastMessageInfo] = useState({});
  const getLastMessageInfo = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_SERVER}/message/get-last-message/${id}`
    );
    setLastMessageInfo(data?.lastMessageInfo);
  };
  const handleClick = async () => {
    //get room id and set Active chat context to clicked contact
    try {
      if (searched) {
        setShowInviteBox({
          isShow: true,
          searchedId: id,
          searchedUsername: name,
        });
        return;
      }
      if (activeChat?.c_id != id) {
        const roomResponse = await axios.post(
          `${import.meta.env.VITE_SERVER}/contact/create-room`,
          { contactId: id }
        );
        if (roomResponse?.data?.success) {
          const messages = await axios.get(
            `${import.meta.env.VITE_SERVER}/message/get-messages/${
              roomResponse?.data?.room
            }/1`
          );
          const recievedMessages = messages?.data?.messages;
          // setActiveChat({
          //   c_id: id,
          //   room: roomResponse?.data?.room,
          //   messages: recievedMessages,
          // });
          setActiveChat((prevState) => ({
            ...prevState,
            c_id: id,
            room: roomResponse?.data?.room || prevState.room,
            messages: recievedMessages || prevState.messages,
          }));
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
            {lastMessageInfo?.lastMessage?.slice(0, 20)}...
          </span>
        </div>
        <div className="otherchats-info">
          <span className="otherchats-info-time">
            {lastMessageInfo?.timeSent}
          </span>
          <span className="otherchats-info-notification">
            {notify ? <div className="notification"></div> : <div></div>}
          </span>
        </div>
      </Tilt>
    </div>
  );
};

OtherChats.defaultProps = {
  active: false,
};
export default OtherChats;
