import React, { useState } from "react";
import background from "../assets/Chill-Lofi-Background-Wallpaper-Full-HD-Free-Download-for-PC-Laptop-Macbook-231121-Wallpaperxyz.com-1.gif";
import ChattingSection from "../components/Layout/chatmenu/ChattingSection";
import ChatMenu from "../components/Layout/chatmenu/ChatMenu";
import SideBar from "../components/Layout/chatmenu/SideBar";
import { ContactDetailsProvider } from "../context/ContactDetailsContext";
import { useAuth } from "../context/authContext";
const Layout = () => {
  const [auth, setAuth] = useAuth();
  const [sideBarTab, setSideBarTab] = useState("chats");
  const [showInviteBox, setShowInviteBox] = useState({
    isShow: false,
    searchedId: "",
    searchedUsername: "",
  });

  // const sendUserLastOnlineTime = async () => {
  //   try {
  //     await axios.patch(`${import.meta.env.VITE_SERVER}/contact/stay-online`);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  //Every five seconds we check if the user had the home page opened
  //we send a simple request and in the backend a field containing the last online time is updated
  //to check if a user is online check if that last online is close in time to the current time
  //uncomment it to resume functionality
  // useEffect(() => {
  //   setInterval(() => {
  //     sendUserLastOnlineTime();
  //   }, 1000 * 5);
  // }, []);
  return (
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
          />
          <ChattingSection
            showInviteBox={showInviteBox}
            setShowInviteBox={setShowInviteBox}
          />
        </div>

        <img src={background} alt="background" className="background" />
      </div>
    </ContactDetailsProvider>
  );
};

export default Layout;
