import React, { useState } from "react";
import ChatNavbar from "../chat/ChatNavbar";
import ChatMain from "../chat/ChatMain";
import CallMain from "../chat/callMain";

const ChattingSection = () => {
  const [isCall, setIsCall] = useState(false);

  return (
    <div className="chattingsection">
      <ChatNavbar isCall={isCall} />
      {isCall ? <CallMain /> : <ChatMain />}
    </div>
  );
};

export default ChattingSection;
