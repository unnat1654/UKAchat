import { useCallback, useEffect } from "react";
import peer from "../services/peer";

export const useCaller = (socket, useMyCall, auth, activeChat) => {
  const [myCall, setMyCall] = useMyCall;
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
  const sendCall = useCallback(
    async (type) => {
      if (
        activeChat?.online == false ||
        activeChat?.room == "" ||
        auth?.user?.username == "" ||
        myCall?.room != ""
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
    },
    [activeChat?.room, auth?.user, myCall?.room, activeChat?.online]
  );
  const endCall = useCallback(() => {
    stopStreams();
    setMyCall({ ringing: false, room: "", stream: "", type: "voice" });
    if (!myCall.room) return;
    console.log(JSON.stringify(myCall));
    if (myCall.ringing) socket.emit("end-unreceived-call", myCall.room);
    if (!myCall.ringing) socket.emit("end-received-call", myCall.room);
    setMyCall({ stream: "", room: "", ringing: false });
  }, [socket, myCall]);

  return { myCall, sendCall, endCall };
};
