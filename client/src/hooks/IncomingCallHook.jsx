import { useEffect, useState, useCallback } from "react";

export const useIncomingCall = (socket) => {
  const [callInfo, setCallInfo] = useState({
    room: "",
    username: "",
    photo: "",
    offer: "",
    type: "voice",
  });
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
  return callInfo;
};
