import { useEffect, useState, useCallback } from "react";
import peer from "../services/peer";
export const useIncomingCall = (socket,useMyCall) => {
  const [myCall, setMyCall] = useMyCall;
  const [callInfo, setCallInfo] = useState({
    room: "",
    username: "",
    photo: "",
    offer: "",
    type: "voice",
  });

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
    setMyCall({room:callInfo.room,ringing:false,stream,type:callInfo.type});
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
    console.log("acceptIncomingCall function ran");
  }catch(error){
    console.log(error);
  }
  }, [socket,sendStreams,myCall]);

  const declineIncomingCall = useCallback(async () => {
    socket.emit("decline-call", callInfo.room);
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
    console.log("declineIncomingCall function ran");
  }, [socket]);

  const handleIncomingCall = useCallback(
    async (info) => {
      console.log("event recieved:incoming-call" + JSON.stringify(info));
      //info={room,offer,username,photo,type:"voice"|"video"}
      if (callInfo.username != "") return;
      setCallInfo(info);
    },
    [socket]
  );
  const handleIncomingCallEnd = useCallback((info) => {
    console.log("event recieved:incoming-call-ended");
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("incoming-call", handleIncomingCall);
      socket.on("incoming-call-ended", handleIncomingCallEnd);
      return () => {
        socket.off("incoming-call", handleIncomingCall);
      };
    }
  }, [socket, handleIncomingCall]);

  return {callInfo,acceptIncomingCall,declineIncomingCall};
};
