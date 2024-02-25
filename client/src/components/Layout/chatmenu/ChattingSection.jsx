import React, { useEffect, useState } from "react";
import ChatNavbar from "../chat/ChatNavbar";
import ChatMain from "../chat/ChatMain";
import CallMain from "../chat/callMain";
import { useContactDetailsArray } from "../../../context/ContactDetailsContext";
import { useActiveChat } from "../../../context/activeChatContext";
import SendInvite from "../invite/sendInvite";

const ChattingSection = ({showInviteBox,setShowInviteBox}) => {
  const [isCall, setIsCall] = useState(false);
  const [activeChat, setActiveChat]= useActiveChat();
  const [contactDetailsArray,setContactDetailsArray]=useContactDetailsArray();
  useEffect(() => {
    if(activeChat?.room){
      const contactObject=contactDetailsArray.detailsArray.find((contactDetailsObject)=>contactDetailsObject._id==activeChat?.c_id);
      if(contactObject){
        setActiveChat({...activeChat,username:contactObject.username,photo:contactObject?.photo?.secure_url})
      }
    }
    
  }, [activeChat?.room]);
  return (
    <div className="chattingsection">
      {showInviteBox.isShow && <SendInvite inviteId={showInviteBox.searchedId} contactName={showInviteBox.searchedUsername}/>}
      {!showInviteBox.isShow && 
      <><ChatNavbar isCall={isCall} />
      {isCall ? <CallMain /> : <ChatMain />}</>}
    </div>
  );
};

export default ChattingSection;
