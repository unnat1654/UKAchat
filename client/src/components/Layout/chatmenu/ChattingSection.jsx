import { useCallback, useEffect, useState } from "react";
import axios from "axios";
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

const ChattingSection = ({ showInviteBox, setShowInviteBox,useMyStream }) => {
  const [callRoom, setCallRoom] = useState("");
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const socket = useSocket();
  const [myStream,setMyStream]=useMyStream;
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [page, setPage] = useState({ prevPage: 0, currPage: 1 });
  const [liveMessages, addLiveMessage] = useLiveMessages(
    socket,
    activeChat,
    setActiveChat,
    page.currPage
  );
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
  const sendStreams= useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const handleVoiceCall=useCallback(async ()=>{
   
    const username=auth?.user?.username;
    const photo=auth?.user?.photo;
    const room=activeChat?.room;
    if(!username || !room){
      return;
    }
    const stream=await navigator.mediaDevices.getUserMedia({
      audio:true
    });
    setMyStream(stream);
    sendStreams();
    console.log(myStream);
    const offer = await peer.getOffer();
    socket.emit("handle-voice-call",{room,offer,username,photo});
    setCallRoom(room);
    
  },[socket]);

  const handleVideoCall=useCallback(()=>{

  },[]);

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
      setActiveChat((prev) => ({
        ...prev,
        username: contactObject.username,
        photo: contactObject?.photo?.secure_url,
        online,
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
          <ChatNavbar callRoom={callRoom} handleVoiceCall={handleVoiceCall} handleVideoCall={handleVideoCall} useMyStream={useMyStream} />
          {callRoom===activeChat?.room ? (
            <CallMain />
          ) : (
            <ChatMain
              addLiveMessage={addLiveMessage}
              onlineContacts={onlineUsers.onlineContacts}
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
