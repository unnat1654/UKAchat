import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import {
  generateKeyPair,
  saveUserRoomKey,
} from "../functions/encryptionFunctions";

const Invite = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const [status, setStatus] = useState("Processing invite...");

  useEffect(() => {
    const acceptInvite = async () => {
      if (!auth?.token) {
        localStorage.setItem("pendingInvite", inviteId);
        toast("Please login to accept the invite");
        navigate("/login");
        return;
      }
      try {
        const userKeys = await generateKeyPair();
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER}/request/qr-accept`,
          { inviteId, userPublicKey: userKeys.publicKey }
        );
        if (!data?.success) {
          setStatus(data?.message || "Failed to accept invite");
          toast.error(data?.message || "Failed to accept invite");
          return;
        }
        await saveUserRoomKey(
          data.roomId,
          userKeys.privateKey,
          data.contactPublicKey
        );
        toast.success("Added as contact!");
        localStorage.removeItem("pendingInvite");
        navigate("/");
      } catch (error) {
        console.log(error);
        setStatus("Error processing invite");
        toast.error("Error processing invite");
      }
    };
    acceptInvite();
  }, [auth?.token, inviteId]);

  return (
    <div className="invite-page">
      <p className="invite-page-status">{status}</p>
    </div>
  );
};

export default Invite;
