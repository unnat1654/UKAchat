import React from "react";
import OtherChats from "../chat/OtherChats";
import { IoSearchOutline } from "react-icons/io5";
import Tilt from "react-parallax-tilt";

const ChatMenu = () => {
  return (
    <div className="chatmenu">
      <Tilt className="chatmenu-search-bar">
        <input type="text" placeholder="search for chat..." />
        <IoSearchOutline />
      </Tilt>
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
        active={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />

      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
      <OtherChats
        name="Vijay Mathur"
        message="Hi, Nice to meet you!"
        time="13:45"
        notify={true}
      />
    </div>
  );
};

export default ChatMenu;
