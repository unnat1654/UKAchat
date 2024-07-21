import React from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import RejectIcon from "./RejectIcon";
import AcceptIcon from "./AcceptIcon";
import axios from "axios";
import {
  generateKeyPair,
  saveUserRoomKey,
} from "../../functions/encryptionFunctions";

const Members = ({ sender, photo, id, active, setInvitesArray }) => {
  const handleInvite = async (isAccepted) => {
    try {
      const userKeys = await generateKeyPair();
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/handle-request`,
        { senderId: id, isAccepted, userPublicKey: userKeys.publicKey }
      );
      if (!data?.success) return;
      setInvitesArray((prev) =>
        prev.filter((item) => item.senderUserId !== id)
      );
      if (isAccepted) {
        await saveUserRoomKey(
          data?.roomId,
          userKeys.privateKey,
          data.contactPublicKey
        );
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
        <div className="accept-button" onClick={() => handleInvite(true)}>
          <AcceptIcon />
        </div>
        <div className="reject-button" onClick={() => handleInvite(false)}>
          <RejectIcon />
        </div>
      </div>
    </Tilt>
  );
};

export default Members;
