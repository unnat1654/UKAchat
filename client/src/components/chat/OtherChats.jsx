import React, { useCallback, useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import axios from "axios";

import { useActiveChat } from "../../context/activeChatContext";
import { convertTimeTo12 } from "../../functions/timeFunction";
import {
  getLSMsgTimeRange,
  getRoomLSMessages,
} from "../../functions/localStorageFunction";
import { decrypt, getRoomSharedKey } from "../../functions/encryptionFunctions";

const OtherChats = ({
  room,
  name,
  photo,
  notify,
  id,
  active,
  searched,
  setShowInviteBox,
  lastMessage,
}) => {
  const [lastTextMessage, setLastTextMessage] = useState("");
  const [activeChat, setActiveChat] = useActiveChat();

  const decryptMessage = useCallback(async () => {
    let textMessage = "";
    if (lastMessage?.text) {
      textMessage = await decrypt(
        getRoomSharedKey(room),
        lastMessage.iv,
        lastMessage.text
      );
    }
    setLastTextMessage(textMessage);
  }, [lastMessage]);

  useEffect(() => {
    decryptMessage();
  }, [decryptMessage]);

  const handleClick = useCallback(async () => {
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
        const roomResponse = await axios.get(
          `${import.meta.env.VITE_SERVER}/contact/get-room/${id}`
        );
        if (roomResponse?.data?.success) {
          const room = roomResponse?.data?.room;
          const [firstTime, lastTime] = getLSMsgTimeRange(room);
          const messagesResponse = await axios.get(
            `${
              import.meta.env.VITE_SERVER
            }/message/get-messages?room=${room}&page=1${
              firstTime ? `&firstTime=${firstTime}` : ""
            }${lastTime ? `&lastTime=${lastTime}` : ""}`
          );
          const recievedMessages = messagesResponse?.data?.messages;

          if (messagesResponse?.data?.success) {
            const msgInLS = getRoomLSMessages(
              room,
              0 == messagesResponse.data.newMessagesCount
            ); // if new messages are found then getRoomLSMessages are not required
            setActiveChat({
              c_id: id,
              room,
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
  }, [activeChat?.room, searched]);
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
          {lastMessage && (
            <span className="otherchats-chat-message">
              {lastMessage.sent && "You: "}
              {!lastTextMessage ? "File Shared" : lastTextMessage?.slice(0, 20)}
              {lastTextMessage?.length > 20 ? "..." : ""}
            </span>
          )}
        </div>
        <div className="otherchats-info">
          <span className="otherchats-info-time">
            {lastMessage?.timeSent
              ? convertTimeTo12(lastMessage?.timeSent)
              : ""}
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
