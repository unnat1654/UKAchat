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
      setAuth({
        user: null,
        token: "",
      });
      toast.success("Logout Successful");
      navigate("/login");
    }
  };

  if (auth?.token) {
    return (
      <div
        className="logout-menu"
        style={{ visibility: show ? "visible" : "hidden" }}
        onMouseLeave={() => {
          setShow(false);
        }}
      >
        <div className="logout-menu-item">
          <PiUserSwitch className="logout-menu-icon" />
          <p>Change Profile Picture</p>
        </div>
        <hr />
        <div className="logout-menu-item">
          <LuQrCode className="logout-menu-icon" />
          <p>QR Code</p>
        </div>
        <hr />
        <div className="logout-menu-item">
          <button className="logout-menu-button" onClick={handleClick}>
            Logout
          </button>
        </div>
      </div>
    );
  }
};

export default logout-menu;
