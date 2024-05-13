import React, { useCallback, useEffect, useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { IoMicOffOutline } from "react-icons/io5";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import ReactPlayer from "react-player";
import UserIcon from "../UserIcon";
import peer from "../../services/peer";
import { useSocket } from "../../context/socketContext";
import { useActiveChat } from "../../context/activeChatContext";

const CallMain = ({ endCall, callType }) => {
  const [activeChat, setActiveChat] = useActiveChat();
  const socket = useSocket();
  const [remoteStream, setRemoteStream] = useState();
  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStreams = e.streams;
      console.log("Got Tracks");
      setRemoteStream(remoteStreams[0]);
    });
  }, []);
  return (
    <div className="callmain">
      {callType == "voice" && (
        <>
          {activeChat?.photo ? (
            <img className="callmain-user-icon" src={activeChat?.photo} alt="profile pic" />
          ) : (
            <div className="callmain-user-icon">
              <UserIcon size="100%" />
            </div>
          )}
        </>
      )}
      <ReactPlayer playing muted height="100px" width="200px" url={remoteStream} />
      <IoMicOffOutline className="callmain-user-mute-icon" />
      <MdCallEnd onClick={endCall} className="callmain-cut-call-icon" />
      <HiOutlineSpeakerWave className="callmain-mute-call-icon" />
    </div>
  );
};

export default CallMain;
