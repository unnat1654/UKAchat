import React, { useCallback, useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import peer from "../../services/peer";
import { MdCallEnd } from "react-icons/md";
import { IoMicOffOutline } from "react-icons/io5";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useSocket } from "../../context/socketContext";
import { useActiveChat } from "../../context/activeChatContext";

const CallMain = () => {
  const [activeChat, setActiveChat] = useActiveChat();
  const socket = useSocket();
  // const [myStream, setMyStream] = useState();
  // const [remoteStream, setRemoteStream] = useState();

  // const handleCallUser = useCallback(async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //   });
  //   setMyStream(stream);
  //   const offer = await peer.getOffer();
  //   socket.emit("call-user:audio", { room: activeChat?.room, offer });
  // }, [activeChat?.room]);

  // const acceptIncomingCall = useCallback(
  //   async ({ room, offer }) => {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //     });
  //     setMyStream(stream);

  //     const ans = await peer.getAnswer(offer);
  //     socket.emit("call-accepted", {});
  //   },
  //   [socket]
  // );

  // const sendStreams = useCallback(() => {
  //   for (const track of myStream.getTracks()) {
  //     peer.peer.addTrack(track, myStream);
  //   }
  // }, [myStream]);

  // const handleCallAccepted = useCallback(
  //   ({ room, ans }) => {
  //     peer.setLocalDescription(ans);
  //     console.log("call Accepted!");
  //     sendStreams();
  //   },
  //   [sendStreams]
  // );

  // const handleNegoNeeded = useCallback(async () => {
  //   const offer = await peer.getOffer();
  //   socket.emit("peer-nego-needed", { offer, room });
  // }, [activeChat.room, socket]);

  // useEffect(() => {
  //   peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
  //   return () => {
  //     peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, [handleNegoNeeded]);

  // const handleNegoNeedIncoming = useCallback(
  //   async ({ room, offer }) => {
  //     const ans = await peer.getAnswer(offer);
  //     socket.emit("peer-nego-done", { room, ans });
  //   },
  //   [socket]
  // );

  // const handleNegoNeedFinal = useCallback(async ({ ans }) => {
  //   await peer.setLocalDescription(ans);
  // }, []);

  // useEffect(() => {
  //   peer.peer.addEventListener("track", async (e) => {
  //     const remoteStream = ev.streams;
  //     console.log("Got Tracks");
  //     setRemoteStream(remoteStream[0]);
  //   });
  // }, []);

  // useEffect(() => {
  //   socket.on("incoming-call");
  // }, [socket, handleCallUser, handleIncomingCall]);
  return (
    <div className="callmain">
      <div className="callmain-user-icon">
        <UserIcon size="100%" />
      </div>
      <IoMicOffOutline className="callmain-user-mute-icon" />
      <MdCallEnd className="callmain-cut-call-icon" />
      <HiOutlineSpeakerWave className="callmain-mute-call-icon" />
    </div>
  );
};

export default CallMain;
