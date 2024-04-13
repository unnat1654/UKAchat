import React, { useState } from "react";
import { PiUserSwitch } from "react-icons/pi";
import { LuQrCode } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../../context/authContext";
import { useSocket } from "../../../context/socketContext";

const LogoutMenu = ({ show, setShow }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const handleClick = () => {
    if (auth?.token) {
      if (socket) {
        socket.emit("set-offline", auth?.token);
      }

      localStorage.removeItem("auth");
      toast.success("Logout Successful");
      navigate("/login");
    }
  };

  if (auth?.token) {
    return (
      <div
        className="logoutmenu"
        style={{ visibility: show ? "visible" : "hidden" }}
        onMouseLeave={() => {
          setShow(false);
        }}
      >
        <div className="logoutmenu-item">
          <PiUserSwitch className="logoutmenu-icon" />
          <p>Change Profile Picture</p>
        </div>
        <hr />
        <div className="logoutmenu-item">
          <LuQrCode className="logoutmenu-icon" />
          <p>QR Code</p>
        </div>
        <hr />
        <div className="logoutmenu-item">
          <button className="logoutmenu-button" onClick={handleClick}>
            Logout
          </button>
        </div>
      </div>
    );
  }
};

export default LogoutMenu;
