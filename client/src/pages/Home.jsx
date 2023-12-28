import React from "react";
import background from "../../assets/bogdan-mb0sco-coffee-shop-animationfullhd.gif";
import Tilt from "react-parallax-tilt";
import ChatttingSection from "../components/Layout/chatmenu/ChattingSection";
import ChatMenu from "../components/Layout/chatmenu/ChatMenu";
import SideBar from "..components/Layout/chatment/SideBar";
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Tilt
        tiltMaxAngleX={2}
        tiltMaxAngleY={2}
        transitionSpeed={3000}
        trackOnWindow={true}
        className="main"
      >
        <SideBar />
        <ChatMenu />
        <ChatttingSection />
      </Tilt>
      <img src={background} alt="background" className="background" />
    </div>
  );
};

export default Layout;
