import { useCallback, useEffect } from "react";
import peer from "../services/peer";

export const useCaller = (socket, useMyCall, auth, activeChat) => {
  const [myCall, setMyCall] = useMyCall;
  const stopStreams = useCallback(() => {
    if (!myCall.stream) return;
    for (const track of myCall.stream?.getTracks()) {
      track.stop();
    }
  }, [myCall.stream]);

  const handleCallAccepted = useCallback(
    async ({ room, ans }) => {
      await peer.setLocalDescription(ans);
      setMyCall((prev) => ({ ...prev, ringing: false, room }));
    },
    []
  );
  const handleCallDeclined = useCallback(async ({ room }) => {
    peer.reset();
    setMyCall({ stream: "", ringing: false, room: "", type: "voice" });
  }, []);

  const handleCallEnd = useCallback(() => {
    stopStreams();
    peer.reset();
    setMyCall({ stream: "", ringing: false, room: "", type: "voice" });
  }, [stopStreams]);

  useEffect(() => {
    if (socket) {
      socket.on("call-accepted", handleCallAccepted);
      socket.on("call-declined", handleCallDeclined);
      socket.on("call-ended", handleCallEnd);
      return () => {
        socket.off("call-accepted", handleCallAccepted);
        socket.off("call-declined", handleCallDeclined);
        socket.off("call-ended", handleCallEnd);
      };
    }
  }, [
    socket,
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
        peer.reset();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          ...(type === "video" && { video: true }),
        });
        for (const track of stream.getTracks()) {
          peer.peer.addTrack(track, stream);
        }
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
    if (!myCall.room) {
      peer.reset();
      setMyCall({ stream: "", room: "", ringing: false, type: "voice" });
      return;
    }
    if (myCall.ringing) socket.emit("end-unreceived-call", myCall.room);
    if (!myCall.ringing) socket.emit("end-received-call", myCall.room);
    peer.reset();
    setMyCall({ stream: "", room: "", ringing: false, type: "voice" });
  }, [socket, myCall, stopStreams]);

  return { myCall, sendCall, endCall };
};
