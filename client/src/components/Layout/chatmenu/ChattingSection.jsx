import React, { useEffect, useState } from "react";
import ChatNavbar from "../chat/ChatNavbar";
import ChatMain from "../chat/ChatMain";
import CallMain from "../chat/callMain";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import { useActiveChat } from "../../../context/activeChatContext";

const ChattingSection = () => {
  const [isCall, setIsCall] = useState(false);
  const [activeChat, setActiveChat]= useActiveChat();
  const [contactDetailsArray,setContactDetailsArray]=useContactDetailsArray([]);
  useEffect(() => {
    if(activeChat?.room){// && contactDetailsArray!=[]){
      console.log("123");
      const contactObject=contactDetailsArray.find((contactDetailsObject)=>contactDetailsObject._id==activeChat?.c_id);
      console.log(contactObject);
      if(contactObject){
        setActiveChat({...activeChat,username:contactObject.username,photo:contactObject?.photo?.secure_url})
      }
    }
    
  }, [activeChat?.room]);
  return (
    <div className="chattingsection">
      <ChatNavbar isCall={isCall} />
      {isCall ? <CallMain /> : <ChatMain />}
    </div>
  );
};

export default ChattingSection;
