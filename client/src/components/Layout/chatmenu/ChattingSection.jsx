import React, { useEffect, useState } from "react";
import ChatNavbar from "../chat/ChatNavbar";
import ChatMain from "../chat/ChatMain";
import CallMain from "../chat/callMain";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import { useActiveChat } from "../../../context/activeChatContext";
import SendInvite from "../invite/sendInvite";
import { useAuth } from "../../../context/authContext";
import axios from "axios";
import { useSocket } from "../../../context/socketContext";
import { useLiveMessages } from "../../../hooks/liveMessagesHook";

const ChattingSection = ({ showInviteBox, setShowInviteBox }) => {
  const [isCall, setIsCall] = useState(false);
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const socket = useSocket();
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [onlineUsers, setOnlineUsers] = useState({
    onlineUserRooms: [],
    onlineContacts: [],
  });
  const getOnlineUsers = async () => {
    try {
      const onlineUsersDetails = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-online-contacts`
      );
      if (onlineUsersDetails?.data?.success) {
        setOnlineUsers({
          onlineUserRooms: onlineUsersDetails?.data?.activeUserRooms,
          onlineContacts: onlineUsersDetails?.data?.onlineContacts,
        });
        socket.emit("join-room", {
          roomsArray: onlineUsersDetails?.data?.activeUserRooms,
        });
      } else {
        console.log(onlineUsersDetails?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [liveMessages,addLiveMessage]=useLiveMessages(socket,activeChat,setActiveChat);
  useEffect(() => {
    if (auth?.token) {
      getOnlineUsers();
    }
  }, [auth?.token, socket]);

  useEffect(() => {
    const contactObject = contactDetailsArray.detailsArray.find(
      (contactDetailsObject) => contactDetailsObject._id == activeChat?.c_id
    );
    let online = false;
    if (
      activeChat?.room &&
      onlineUsers.onlineUserRooms.indexOf(activeChat.room) >= 0
    ) {
      online = true;
    }
    if (contactObject) {
      const roomLiveMessages = liveMessages.get(activeChat.room);
      setActiveChat((prev) => ({
        ...prev,
        username: contactObject.username,
        photo: contactObject?.photo?.secure_url,
        online: online,
        messages: [
          ...prev.messages,
          ...(roomLiveMessages ? roomLiveMessages : ""),
        ],
      }));
    }
  }, [activeChat?.room]);
  return (
    <div className="chattingsection">
      {showInviteBox.isShow && (
        <SendInvite
          inviteId={showInviteBox.searchedId}
          contactName={showInviteBox.searchedUsername}
        />
      )}
      {!showInviteBox.isShow && (
        <>
          <ChatNavbar isCall={isCall} />
          {JSON.stringify([...liveMessages.entries()])}
          {isCall ? (
            <CallMain />
          ) : (
            <ChatMain
              addLiveMessage={addLiveMessage}
              onlineContacts={onlineUsers.onlineContacts}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChattingSection;
