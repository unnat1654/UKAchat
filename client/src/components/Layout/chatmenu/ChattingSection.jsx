import { useCallback, useEffect, useState } from "react";
import ChatNavbar from "../../chat/ChatNavbar";
import ChatMain from "../../chat/ChatMain";
import CallMain from "../../call/CallMain";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import { useActiveChat } from "../../../context/activeChatContext";
import SendInvite from "../../invite/sendInvite";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";
import { useLiveMessages } from "../../../hooks/LiveMessagesHook";
import peer from "../../../services/peer";

const ChattingSection = ({ showInviteBox, setShowInviteBox, useMyCall }) => {
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const socket = useSocket();
  const [myCall, setMyCall] = useMyCall;
  const [contactDetailsArray, setContactDetailsArray] = useContactDetailsArray();
  const [page, setPage] = useState({ prevPage: 0, currPage: 1 });
  const [liveMessages, addLiveMessage] = useLiveMessages(
    socket,
    activeChat,
    setActiveChat,
    page.currPage
  );
  const [onlineUsers, setOnlineUsers] = useState([]);


  const getOnlineUsers = (onlineContacts) => {
    console.log(onlineContacts);
    if(!onlineContacts) return;
    setOnlineUsers(onlineContacts);
  };

  const newContactOnline = useCallback((c_id) => {
    console.log(`Server notification: new contact online: ${c_id}`);
    if (onlineUsers?.includes(c_id)) return;
    setOnlineUsers([...onlineUsers, c_id]);
  }, [onlineUsers]);

  const newContactOffline = useCallback((c_id) => {
    console.log(`Server notification: new contact offline: ${c_id}`);
    if(!onlineUsers) return;
    setOnlineUsers(onlineUsers?.filter(user => user !== c_id));
  }, [onlineUsers]);

  useEffect(() => {
    if (socket) {
      socket.on("get-online-contacts", getOnlineUsers);
      socket.on("new-contact-online", newContactOnline);
      socket.on("one-contact-went-offline", newContactOffline);
      return () => {
        socket.off("get-online-contacts", getOnlineUsers);
        socket.off("new-contact-online", newContactOnline);
        socket.off("one-contact-went-offline", newContactOffline);
      }
    }
  }, [ socket,onlineUsers]);

  const setActiveChatDetails = useCallback(() => {
    if (!contactDetailsArray || !activeChat?.room || !onlineUsers) return;
    const contactObject = contactDetailsArray.detailsArray.find(
      (contactDetailsObject) => contactDetailsObject._id == activeChat.c_id
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
      username: contactObject.username,
      photo: contactObject.photo?.secure_url,
      online,
    }));

  }, [contactDetailsArray, onlineUsers, activeChat.room]);

  useEffect(() => {
    setActiveChatDetails();
  }, [setActiveChatDetails,onlineUsers]);

  const sendStreams = useCallback(() => {
    if (!myCall.stream) return;
    for (const track of myCall.stream?.getTracks()) {
      peer.peer.addTrack(track, myCall.stream);
    }
  }, [myCall?.stream]);
  const stopStreams = useCallback(() => {
    for (const track of myCall.stream?.getTracks()) {
      track.stop();
    }
  }, [myCall.stream]);

  const sendCall = useCallback(async (type) => {
    if (
      (activeChat?.online == false ||
        activeChat?.room == "" ||
        auth?.user?.username == "" ||
        myCall?.room != "")
    ) {
      return;
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        ...(type === "video" && { video: true }),
      });
      const offer = await peer.getOffer();
      socket.emit("send-call", {
        room: activeChat?.room,
        offer,
        username: auth.user.username,
        photo: auth.user.photo,
        type,
      });
      setMyCall({ stream, type, room: activeChat?.room, ringing: true });
    }
  }, [activeChat?.room, auth?.user, myCall?.room, activeChat?.online]);

  useEffect(() => {
    if (auth?.token) {
      getOnlineUsers();
    }
  }, [auth?.token, socket]);

  const handleCallAccepted = useCallback(
    async ({ room, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted");
      setMyCall((prev) => ({ ...prev, ringing: false, room }));
      sendStreams();
    },
    [sendStreams]
  );

  const handleCallDeclined = useCallback(async ({ room }) => {
    setMyCall({ stream: "", ringing: false, room: "", type: "voice" });
    console.log("call declined");
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    if (socket && activeChat && activeChat.room) {
      const offer = await peer.getOffer();
      socket.emit("peer-nego-needed", { room: activeChat?.room, offer });
    }
  }, [activeChat?.room, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ room, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { room, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async (ans) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleCallEnd = useCallback(() => {
    console.log("other person cut the call");
    stopStreams();
    setMyCall({ stream: "", ringing: false, room: "", type: "voice" });
  }, [myCall]);

  const endCall = useCallback(() => {
    stopStreams();
    setMyCall({ ringing: false, room: "", stream: "", type: "voice" });
    if (!myCall.room) return;
    console.log(JSON.stringify(myCall));
    if (myCall.ringing) socket.emit("end-unreceived-call", myCall.room);
    if (!myCall.ringing) socket.emit("end-received-call", myCall.room);
    setMyCall({ stream: "", room: "", ringing: false });
  }, [socket, myCall]);

  useEffect(() => {
    if (socket) {
      socket.on("peer-nego-needed", handleNegoNeedIncoming);
      socket.on("peer-nego-final", handleNegoNeedFinal);
      socket.on("call-accepted", handleCallAccepted);
      socket.on("call-declined", handleCallDeclined);
      socket.on("call-ended", handleCallEnd);
      return () => {
        socket.off("peer-nego-needed", handleNegoNeedIncoming);
        socket.off("peer-nego-final", handleNegoNeedFinal);
        socket.off("call-accepted", handleCallAccepted);
        socket.off("call-declined", handleCallDeclined);
        socket.off("call-ended", handleCallEnd);
      };
    }
  }, [
    socket,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleCallAccepted,
    handleCallDeclined,
    handleCallEnd,
  ]);

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
          <ChatNavbar
            callRoom={{ room: myCall.room, type: myCall.type }}
            sendCall={(type) => sendCall(type)}
          />
          {JSON.stringify(onlineUsers)}
          {myCall.room && myCall.room === activeChat?.room ? (
            <CallMain callType={myCall.type} endCall={endCall} />
          ) : (
            <ChatMain
              addLiveMessage={addLiveMessage}
              onlineContacts={onlineUsers}
              page={page}
              setPage={setPage}
            />
          )}
        </>
      )}
      
    </div>
  );
};

export default ChattingSection;
