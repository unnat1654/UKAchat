import React, { useRef, useState } from "react";
import { PiUserSwitch } from "react-icons/pi";
import { LuQrCode, LuCopy, LuX, LuImage, LuImageOff } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext";
import { LuHardDriveUpload, LuHardDriveDownload } from "react-icons/lu";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  generateKeyPair,
  saveUserRoomKey,
} from "../../functions/encryptionFunctions";
import { useWallpaper } from "../../context/wallpaperContext";

const LogoutMenu = ({ show, setShow }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const photoInputRef = useRef(null);
  const keyInputRef = useRef(null);
  const wallpaperInputRef = useRef(null);
  const { customWallpaper, setCustomWallpaper, removeCustomWallpaper } =
    useWallpaper();
  const [qrModal, setQrModal] = useState({ show: false, url: "" });

  const handleLogout = () => {
    if (auth?.token) {
      if (socket) {
        socket.disconnect();
      }
      localStorage.removeItem("auth");
      setAuth({ user: null });
      toast.success("Logout Successful");
      navigate("/login");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const { data } = await axios.patch(
          `${import.meta.env.VITE_SERVER}/auth/update-photo`,
          { photo: reader.result }
        );
        if (data?.success) {
          const updatedUser = { ...auth.user, photo: data.secure_url };
          setAuth((prev) => ({ ...prev, user: updatedUser }));
          localStorage.setItem(
            "auth",
            JSON.stringify({ user: updatedUser, token: auth.token })
          );
          toast.success("Profile picture updated!");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to update profile picture");
      }
    };
  };

  const handleDownloadKey = () => {
    const keys = localStorage.getItem("userKeys");
    if (!keys) {
      toast.error("No keys found");
      return;
    }
    const blob = new Blob([keys], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ukachat-keys.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportKey = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      try {
        JSON.parse(reader.result);
        localStorage.setItem("userKeys", reader.result);
        toast.success("Keys imported successfully!");
      } catch {
        toast.error("Invalid key file");
      }
    };
  };

  const handleShowQr = async () => {
    try {
      const userKeys = await generateKeyPair();
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/request/generate-qr-invite`,
        { senderPublicKey: userKeys.publicKey }
      );
      if (!data?.success) {
        toast.error(data?.message || "Failed to generate invite");
        return;
      }
      await saveUserRoomKey(data.roomId, userKeys.privateKey);
      const url = `${window.location.origin}/invite/${data.inviteId}`;
      setQrModal({ show: true, url });
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate invite");
    }
  };

  const handleCopyLink = () => {
    if (!qrModal.url) return;
    navigator.clipboard.writeText(qrModal.url);
    toast.success("Invite link copied!");
  };

  const handleCloseQr = () => {
    setQrModal({ show: false, url: "" });
  };

  const handleWallpaperChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setCustomWallpaper(reader.result);
      toast.success("Wallpaper updated!");
    };
  };

  const handleRemoveWallpaper = () => {
    removeCustomWallpaper();
    toast.success("Wallpaper removed");
  };

  if (auth?.token) {
    return (
      <>
        <div
          className="logout-menu"
          style={{ visibility: show ? "visible" : "hidden" }}
          onMouseLeave={() => setShow(false)}
        >
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <input
            type="file"
            ref={keyInputRef}
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportKey}
          />
          <div
            className="logout-menu-item"
            onClick={() => photoInputRef.current.click()}
          >
            <PiUserSwitch className="logout-menu-icon" />
            <p>Change Profile Picture</p>
          </div>
          <hr />
          <div
            className="logout-menu-item"
            onClick={() => wallpaperInputRef.current.click()}
          >
            <LuImage className="logout-menu-icon" />
            <p>Custom Wallpaper</p>
          </div>
          {customWallpaper && (
            <>
              <hr />
              <div
                className="logout-menu-item"
                onClick={handleRemoveWallpaper}
              >
                <LuImageOff className="logout-menu-icon" />
                <p>Remove Wallpaper</p>
              </div>
            </>
          )}
          <hr />
          <input
            type="file"
            ref={wallpaperInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleWallpaperChange}
          />
          <div className="logout-menu-item" onClick={handleShowQr}>
            <LuQrCode className="logout-menu-icon" />
            <p>QR Code</p>
          </div>
          <hr />
          <div
            className="logout-menu-item"
            onClick={() => keyInputRef.current.click()}
          >
            <LuHardDriveUpload className="logout-menu-icon" />
            <p>Import Key</p>
          </div>
          <hr />
          <div className="logout-menu-item" onClick={handleDownloadKey}>
            <LuHardDriveDownload className="logout-menu-icon" />
            <p>Download Key</p>
          </div>
          <hr />
          <div className="logout-menu-item">
            <button className="logout-menu-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        {qrModal.show && (
          <div className="qr-modal-overlay" onClick={handleCloseQr}>
            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
              <LuX className="qr-modal-close" onClick={handleCloseQr} />
              <p className="qr-modal-title">Your One-Time Invite</p>
              <div className="qr-modal-qr">
                <QRCodeSVG value={qrModal.url} size={220} level="M" />
              </div>
              <div className="qr-modal-link">
                <span className="qr-modal-link-text">{qrModal.url}</span>
                <LuCopy className="qr-modal-copy" onClick={handleCopyLink} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default LogoutMenu;
