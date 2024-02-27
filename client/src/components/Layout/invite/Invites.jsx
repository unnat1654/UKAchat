import React, { useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import RejectIcon from "./RejectIcon";
import AcceptIcon from "./AcceptIcon";
import axios from "axios";

const Invites = ({ sender, photo, id, active,setInvitesArray}) => {
  const handleClick = () => {
    console.log("clicked");
  };

  const acceptInvite = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/handle-request`,
        { senderId: id, senderType: "chat", isAccepted: true }
      );
      if (data?.success) {
        console.log(data?.message);
      }
      if(data){
        setInvitesArray((prev)=>(prev.filter(item=>item.senderUserId!==id)));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rejectInvite = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/handle-request`,
        { senderId: id, senderType: "chat", isAccepted: false }
      );
      if (data?.success) {
        console.log(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Tilt
      tiltMaxAngleX={1}
      className={`invites ${active ? "invites-active" : ""}`}
    >
      {photo ? (
        <img src={photo} className="invites-dp" alt="" />
      ) : (
        <UserIcon size="calc(35px + 0.4vw)" />
      )}
      <div className="invites-chat">
        <span className="invites-chat-name">{sender}</span>
      </div>
      <div className="invites-buttons">
        <div className="accept-button" onClick={acceptInvite}>
          <AcceptIcon />
        </div>
        <div className="reject-button" onClick={rejectInvite}>
          <RejectIcon />
        </div>
      </div>
    </Tilt>
  );
};

export default Invites;
