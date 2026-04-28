import React, { useState } from "react";
import UserIcon from "../../UserIcon";
import { Tooltip } from "antd";
import { PiUsersThreeBold } from "react-icons/pi";
import { IoChatbubbleOutline } from "react-icons/io5";
import { BsEnvelopePlus } from "react-icons/bs";
import { LuWallpaper } from "react-icons/lu";
import { useAuth } from "../../../context/authContext";
import { useWallpaper } from "../../../context/wallpaperContext";
import LogoutMenu from "../../logoutmenu/LogoutMenu";

const SideBar = ({ sideBarTab, setSideBarTab, setShowInviteBox }) => {
  const [auth, setAuth] = useAuth();
  const { cycleWallpaper } = useWallpaper();
  const [activeBtn, setActiveBtn] = useState("chats");
  const [show, setShow] = useState(false);

  const handleMouseEnter = () => {
    setShow(true);
  };

  const handleClick = () => {
    setShowInviteBox((prev) => ({ ...prev, isShow: false }));
  };
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-upper-buttons">
          <Tooltip
            placement="right"
            title={"Chats"}
            trigger={"hover"}
            arrow={{ pointAtCenter: true }}
          >
            <div
              onClick={() => {
                setSideBarTab("chats");
                setActiveBtn("chats");
                handleClick();
              }}
              className={activeBtn == "chats" ? "active" : ""}
            >
              <IoChatbubbleOutline />
            </div>
          </Tooltip>
          <Tooltip
            placement="right"
            title={"Invites"}
            trigger={"hover"}
            arrow={{ pointAtCenter: true }}
          >
            <div
              onClick={() => {
                setSideBarTab("invites");
                setActiveBtn("invites");
                handleClick();
              }}
              className={activeBtn == "invites" ? "active" : ""}
            >
              <BsEnvelopePlus />
            </div>
          </Tooltip>
          
        </div>
        <div className="sidebar-lower-buttons">
          <Tooltip
            placement="right"
            title={"Change Wallpaper"}
            trigger={"hover"}
            arrow={{ pointAtCenter: true }}
          >
            <div
              className="sidebar-lower-buttons-wallpaper"
              onClick={cycleWallpaper}
            >
              <LuWallpaper />
            </div>
          </Tooltip>
          <div className="sidebar-lower-buttons-icon" onClick={handleMouseEnter}>
            {auth?.user?.photo ? (
              <img
                src={auth?.user?.photo}
                className="sidebar-lower-buttons-icon-img"
                alt="profile"
              />
            ) : (
              <UserIcon size="calc(20px + 0.8vw)" />
            )}
          </div>
        </div>
      </div>
      <LogoutMenu show={show} setShow={setShow} />
    </>
  );
};

export default SideBar;
