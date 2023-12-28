import React, { useState } from "react";
import ChatNavbar from "../chat/ChatNavbar";
import ChatMain from "../chat/ChatMain";
import CallMain from "../chat/callMain";

const ChatttingSection = () => {
  const [isCall, setIsCall] = useState(true);
  return (
    <div className="chattingsection">
      <ChatNavbar hideCallOptions={isCall} />
      {isCall ? <CallMain /> : <ChatMain />}
    </div>
  );
};

export default ChatttingSection;
