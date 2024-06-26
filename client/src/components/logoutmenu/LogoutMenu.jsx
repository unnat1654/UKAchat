import React from "react";
import { PiUserSwitch } from "react-icons/pi";
import { LuQrCode } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext";
import { LuHardDriveUpload, LuHardDriveDownload } from "react-icons/lu";
import { Tooltip } from "antd";

const LogoutMenu = ({ show, setShow }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const handleClick = () => {
    if (auth?.token) {
      if (socket) {
        socket.disconnect();
      }

      localStorage.removeItem("auth");
      setAuth({
        user: null,
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
          <LuHardDriveUpload className="logout-menu-icon" />
          <p>Import Key</p>
        </div>
        <hr />
        <Tooltip
          placement="top"
          title={"Chatsddsd"}
          trigger={"hover"}
          arrow={{ pointAtCenter: true }}
        >
          <div className="logout-menu-item">
            <LuHardDriveDownload className="logout-menu-icon" />
            <p>Download Key</p>
          </div>
        </Tooltip>
        <hr />
        <Tooltip
          placement="top"
          title={"Chats"}
          trigger={"hover"}
          arrow={{ pointAtCenter: true }}
        >
          <div className="logout-menu-item">
            <button className="logout-menu-button" onClick={handleClick}>
              Logout
            </button>
          </div>
        </Tooltip>
      </div>
    );
  }
};

export default LogoutMenu;
