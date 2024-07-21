import React from "react";
import axios from "axios";
import { LuUserPlus } from "react-icons/lu";
import {
  generateKeyPair,
  saveUserRoomKey,
} from "../../functions/encryptionFunctions";

const SendInvite = ({ inviteId, contactName, setShowInviteBox }) => {
  const handleClick = async () => {
    try {
      const userKeys = await generateKeyPair();
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/send-request`,
        {
          sentToId: inviteId,
          senderPublicKey: JSON.stringify(userKeys.publicKey),
          timeSent: Date.now(),
        }
      );
      if (data?.success) {
        await saveUserRoomKey(data?.roomId, userKeys.privateKey);
        setShowInviteBox({
          isShow: false,
          searchedId: "",
          searchedUsername: "",
        });
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
