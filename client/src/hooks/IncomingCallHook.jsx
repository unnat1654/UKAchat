import { useEffect, useState, useCallback } from "react";
import peer from "../services/peer";
export const useIncomingCall = (socket, useMyCall) => {
  const [myCall, setMyCall] = useMyCall;
  const [callInfo, setCallInfo] = useState({
    room: "",
    username: "",
    photo: "",
    offer: "",
    type: "voice",
  });

  const acceptIncomingCall = useCallback(async () => {
    try {
      peer.reset();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        ...(callInfo?.type == "video" && { video: true }),
      });
      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, stream);
      }
      const ans = await peer.getAnswer(callInfo.offer);
      socket.emit("accept-call", { room: callInfo.room, ans });
      setMyCall({ room: callInfo.room, ringing: false, stream, type: callInfo.type });
      setCallInfo({
        room: "",
        username: "",
        photo: "",
        offer: "",
        type: "voice",
      });
    } catch (error) {
      console.log(error);
    }
  }, [socket, callInfo]);

  const declineIncomingCall = useCallback(async () => {
    socket.emit("decline-call", callInfo.room);
    setCallInfo({
      room: "",
      username: "",
      photo: "",
      offer: "",
      type: "voice",
    });
  }, [socket, callInfo]);

  const handleIncomingCall = useCallback(
    async (info) => {
      if (callInfo.username != "") return;
      setCallInfo(info);
    },
    [socket, callInfo]
  );
  const handleIncomingCallEnd = useCallback((info) => {
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
        socket.off("incoming-call-ended", handleIncomingCallEnd);
      };
    }
  }, [socket, handleIncomingCall]);

  return { callInfo, acceptIncomingCall, declineIncomingCall };
};
