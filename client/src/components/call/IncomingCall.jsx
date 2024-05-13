import React, { useCallback } from "react";
import Tilt from "react-parallax-tilt";
import UserIcon from "../UserIcon";
import { useSocket } from "../../context/socketContext";
import { IoCallSharp, IoVideocam, IoCloseOutline } from "react-icons/io5";
import peer from "../../services/peer";

const IncomingCall = ({ useCallInfo, useMyCall }) => {
  const socket = useSocket();
  const [myCall, setMyCall] = useMyCall;
  const [callInfo, setCallInfo] = useCallInfo;
  
  const sendStreams = useCallback(() => {
    if(!myCall.stream) return;
    for (const track of myCall.stream?.getTracks()) {
      peer.peer.addTrack(track, myCall.stream);
    }
    console.log("sending Streams");
  }, [myCall?.stream]);

  const acceptIncomingCall = useCallback(async () => {
    try{
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      ...(callInfo?.type == "video" && { video: true }),
    }); 
    sendStreams();
    const ans = await peer.getAnswer(callInfo.offer);
    socket.emit("accept-call", { room: callInfo.room, ans });
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
    setMyCall({room:callInfo.room,ringing:false,stream,type:callInfo.type});
    console.log("acceptIncomingCall function ran");
  }catch(error){
    console.log(error);
  }
  }, [socket,sendStreams,myCall]);

  const declineIncomingCall = useCallback(async () => {
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
    socket.emit("decline-call", callInfo.room);
    console.log("declineIncomingCall function ran");
  }, [socket]);

  return (
    <Tilt tiltMaxAngleX={1} className="incoming-call">
      {callInfo.photo ? (
        <img className="incoming-call-photo" src={callInfo.photo} alt="caller-profile" />
      ) : (
        <UserIcon classNameProp="incoming-call-photo" />
      )}
      <p className="incoming-call-username">{callInfo.username}</p>
      <div className="incoming-call-buttons">
        {callInfo.type == "voice" ? (
          <IoCallSharp className="incoming-call-buttons-accept" onClick={acceptIncomingCall} />
        ) : (
          <IoVideocam className="incoming-call-buttons-accept" onClick={acceptIncomingCall} />
        )}

        <IoCloseOutline className="incoming-call-buttons-decline" onClick={declineIncomingCall} />
      </div>
    </Tilt>
  );
};

export default IncomingCall;
