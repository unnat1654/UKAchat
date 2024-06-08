import React from "react";
import axios from "axios";
import { LuUserPlus } from "react-icons/lu";
import {
  generateKeyPair,
  saveUserRoomKey,
} from "../../functions/encryptionFunctions";

const SendInvite = ({ inviteId, contactName }) => {
  const handleClick = async () => {
    try {
      const userKeys = await generateKeyPair();
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/send-request`,
        {
          sentToId: inviteId,
          senderPublicKey: userKeys.publicKey,
          timeSent: Date.now(),
        }
      );
      if (data?.success) {
        saveUserRoomKey(data?.roomId, userKeys.privateKey);
        console.log(data?.message);
      } else if (data?.success === false) {
        console.log(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="sendinvitebox">
      <p className="sendinvitebox-text">
        Aspire to chat with <span>{contactName}</span>? Click the button below
        to send an invite!
      </p>
      <button onClick={handleClick} className="sendinvitebox-button">
        <LuUserPlus className="sendinvitebox-button-icon" />
        <span>Invite</span>
      </button>
    </div>
  );
};

export default SendInvite;
