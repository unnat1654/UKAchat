import React, { useEffect, useState } from "react";
import OtherChats from "../chat/OtherChats";
import { IoSearchOutline } from "react-icons/io5";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import { useActiveChat } from "../../../context/activeChatContext";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";

const ChatMenu = () => {
  const [searchInput, setSearchInput] = useState("");
  const [contactDetailsArray,setContactDetailsArray] = useContactDetailsArray([]);
  const [activeChat, setActiveChat] = useActiveChat();
  const [auth, setAuth] = useAuth();
  const [activeColor,setActiveColor]=useState("");

  const getContactDetails = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/get-contacts`
      );
      if (data?.success) {
        setContactDetailsArray(data?.contactDetailsArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //on component mount get contacts and set that user is online
  useEffect(() => {
    if (auth?.token) {
      getContactDetails();
    }
  }, [auth]);

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/contact/search-contact/${searchInput}`
      );
      if (data?.success) {
        setContactDetailsArray([data?.contact]);
      } else {
        console.log(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="chatmenu">
      <Tilt className="chatmenu-search-bar">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
          placeholder="search for chat..."
        />
        <span onClick={handleSearch}>
          <IoSearchOutline />
        </span>
      </Tilt>
      {JSON.stringify(activeChat)}
      <React.Fragment>
        {contactDetailsArray.map((c) => (
          <OtherChats
            name={c.username}
            photo={c.photo.secure_url}
            notify={c.online}
            key={c._id}
            id={c._id}
            active={c._id===activeColor}
            onClick={()=>{setActiveColor(c._id)}}
          />
        ))}
      </React.Fragment>
    </div>
  );
};

export default ChatMenu;
