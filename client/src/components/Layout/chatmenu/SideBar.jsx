import React, { useState } from "react";
import UserIcon from "../../UserIcon";
import { Tooltip } from "antd";
import { PiUsersThreeBold } from "react-icons/pi";
import { MdOutlineGroupAdd } from "react-icons/md";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { BsEnvelopePlus } from "react-icons/bs";
import { useAuth } from "../../../context/authContext";
import LogoutMenu from "../../logoutmenu/LogoutMenu";

const SideBar = ({ sideBarTab, setSideBarTab, setShowInviteBox }) => {
  const [auth, setAuth] = useAuth();
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
          <Tooltip
            placement="right"
            title={"Groups"}
            trigger={"hover"}
            arrow={{ pointAtCenter: true }}
          >
            <div
              onClick={() => {
                setSideBarTab("groups");
                setActiveBtn("groups");
                handleClick();
              }}
              className={activeBtn == "groups" ? "active" : ""}
            >
              <PiUsersThreeBold />
            </div>
          </Tooltip>
          <Tooltip
            placement="right"
            title={"Create Group"}
            trigger={"hover"}
            arrow={{ pointAtCenter: true }}
          >
            <div
              onClick={() => {
                setSideBarTab("creategroup");
                setActiveBtn("creategroup");
                handleClick();
              }}
              className={activeBtn == "creategroup" ? "active" : ""}
            >
              <MdOutlineGroupAdd />
            </div>
          </Tooltip>
        </div>
        <div className="sidebar-lower-buttons">
          <MdOutlineSettings className="sidebar-lower-buttons-setting" />
          {auth?.user?.photo ? (
            <img
              src={auth?.user?.photo}
              className="sidebar-lower-buttons-icon"
              onClick={handleMouseEnter}
            />
          ) : (
            <UserIcon size="calc(25px + 1vw)" />
          )}
        </div>
      </div>
      <LogoutMenu show={show} setShow={setShow} />
    </>
  );
};

export default SideBar;
