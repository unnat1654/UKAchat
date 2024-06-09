import React from "react";
import Tilt from "react-parallax-tilt";
import UserIcon from "../UserIcon";
import { useSocket } from "../../context/socketContext";
import { IoCallSharp, IoVideocam, IoCloseOutline } from "react-icons/io5";
import { useIncomingCall } from "../../hooks/IncomingCallHook";

const IncomingCall = ({  useMyCall }) => {
  const socket = useSocket();
  const {callInfo,acceptIncomingCall,declineIncomingCall} = useIncomingCall(socket,useMyCall);
  if(callInfo.room){
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
  );} else {
    return <></>;
  }
};


export default IncomingCall;
