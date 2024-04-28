import React, { useCallback } from "react";
import Tilt from "react-parallax-tilt";
import UserIcon from "../UserIcon";
import { useSocket } from "../../context/socketContext";
import { IoCallSharp, IoVideocam, IoCloseOutline } from "react-icons/io5";
import peer from "../../services/peer";

const IncomingCall = ({ callerInfo, setCallerInfo, useMyStream }) => {
  const socket = useSocket();
  const [myStream,setMyStream]=useMyStream;
  const sendStreams= useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const acceptIncomingCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(callerInfo.offer);
    socket.emit("call-accepted", { room: callerInfo.room, ans });
  }, [socket]);

  const declineIncomingCall = useCallback(async () => {
    socket.emit("call-declined", callerInfo.room);
    setCallerInfo({room:"",username:"",photo:"",offer:"",type:"voice"});
  }, [socket]);
  return (
    <Tilt tiltMaxAngleX={1} className="incoming-call">
      {callerInfo.photo ? (
        <img
          className="incoming-call-photo"
          src={callerInfo.photo}
          alt="caller-profile"
        />
      ) : (
        <UserIcon classNameProp="incoming-call-photo" />
      )}
      <p className="incoming-call-username">{callerInfo.username}</p>
      <div className="incoming-call-buttons">
        {callerInfo.type == "voice" ? (
          <IoCallSharp
            className="incoming-call-buttons-accept"
            onClick={acceptIncomingCall}
          />
        ) : (
          <IoVideocam
            className="incoming-call-buttons-accept"
            onClick={acceptIncomingCall}
          />
        )}

        <IoCloseOutline
          className="incoming-call-buttons-decline"
          onClick={declineIncomingCall}
        />
      </div>
    </Tilt>
  );
};

export default IncomingCall;
