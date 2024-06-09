import React, { useState, useEffect, useCallback } from "react";
import background from "../assets/Chill-Lofi-Background-Wallpaper-Full-HD-Free-Download-for-PC-Laptop-Macbook-231121-Wallpaperxyz.com-1.gif";
import ChattingSection from "../components/Layout/chatmenu/ChattingSection";
import ChatMenu from "../components/Layout/chatmenu/ChatMenu";
import SideBar from "../components/Layout/chatmenu/SideBar";
import { ContactDetailsProvider } from "../context/ContactDetailsContext";
import { useAuth } from "../context/authContext";
import { saveAllOldMessages } from "../functions/localStorageFunction";
import { GroupDetailsProvider } from "../context/groupDetailsContext";
import { useOnlineUsers } from "../hooks/onlineUsersHook";
const Layout = () => {
  const [auth, setAuth] = useAuth();
  const [sideBarTab, setSideBarTab] = useState("chats");
  const [myCall, setMyCall] = useState({
    stream: "",
    room: "",
    ringing: false,
    type: "voice",
  });
  const onlineUsers=useOnlineUsers();
  const [showInviteBox, setShowInviteBox] = useState({
    isShow: false,
    searchedId: "",
    searchedUsername: "",
  });
  let count = 0;
  useEffect(() => {
    const backUpMessages = () => {
      if (count > 10) {
        saveAllOldMessages();
        count = 0;
      }
    };

    window.addEventListener("storage", backUpMessages);
    return () => window.removeEventListener("storage", backUpMessages);
  }, []);
  return (
    <GroupDetailsProvider>
      <ContactDetailsProvider>
        <div className="layout">
          <div className="main">
            <SideBar
              sideBarTab={sideBarTab}
              setSideBarTab={setSideBarTab}
              setShowInviteBox={setShowInviteBox}
            />
            <ChatMenu
              sideBarTab={sideBarTab}
              setShowInviteBox={setShowInviteBox}
              useMyCall={[myCall, setMyCall]}
              onlineUsers={onlineUsers}
            />
            <ChattingSection
              showInviteBox={showInviteBox}
              setShowInviteBox={setShowInviteBox}
              useMyCall={[myCall, setMyCall]}
              onlineUsers={onlineUsers}
            />
          </div>

          <img src={background} alt="background" className="background" />
        </div>
      </ContactDetailsProvider>
    </GroupDetailsProvider>
  );
};

export default Layout;
