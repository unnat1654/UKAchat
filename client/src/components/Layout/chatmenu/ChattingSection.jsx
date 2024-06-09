import { useCallback, useEffect, useState } from "react";
import ChatNavbar from "../../chat/ChatNavbar";
import ChatMain from "../../chat/ChatMain";
import CallMain from "../../call/CallMain";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import { useActiveChat } from "../../../context/activeChatContext";
import SendInvite from "../../invite/SendInvite";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";
import { useCaller } from "../../../hooks/callerHook";

const ChattingSection = ({ showInviteBox, setShowInviteBox, useMyCall,onlineUsers}) => {
  const [activeChat, setActiveChat] = useActiveChat();
  const socket = useSocket();
  const [auth, setAuth] = useAuth();
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();

  const { myCall, sendCall, endCall } = useCaller(
    socket,
    useMyCall,
    auth,
    activeChat
  );

  const setActiveChatDetails = useCallback(() => {
    if (!contactDetailsArray || !activeChat?.room || !onlineUsers) return;
    const contactObject = contactDetailsArray.detailsArray.find(
      (contactDetailsObject) => contactDetailsObject.contact._id == activeChat.c_id
    );
    if (!contactObject) {
      return;
    }
    let online = false;
    if (activeChat.room && onlineUsers.includes(activeChat.c_id)) {
      online = true;
    }
    setActiveChat((prev) => ({
      ...prev,
      username: contactObject.contact.username,
      photo: contactObject.contact.photo?.secure_url,
      online,
    }));
  }, [contactDetailsArray, onlineUsers, activeChat?.room]);
  useEffect(() => {
    setActiveChatDetails();
  }, [setActiveChatDetails, onlineUsers]);

  return (
    <div className="chattingsection">
      {showInviteBox.isShow && (
        <SendInvite
          inviteId={showInviteBox.searchedId}
          contactName={showInviteBox.searchedUsername}
          setShowInviteBox={setShowInviteBox}
        />
      )}
      {!showInviteBox.isShow && (
        <>
          <ChatNavbar
            callRoom={{ room: myCall.room, type: myCall.type }}
            sendCall={(type) => sendCall(type)}
          />
          {myCall.room && myCall.room === activeChat?.room ? (
            <CallMain callType={myCall.type} endCall={endCall} />
          ) : (
            <ChatMain />
          )}
        </>
      )}
    </div>
  );
};

export default ChattingSection;
