import React, { useState } from "react";
import { PiUserSwitch } from "react-icons/pi";
import { LuQrCode } from "react-icons/lu";

const LogoutMenu = ({ show, setShow }) => {
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
        <button className="logoutmenu-button">Logout</button>
      </div>
    </div>
  );
};

export default LogoutMenu;
