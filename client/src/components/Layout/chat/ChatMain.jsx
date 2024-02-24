import React, { useState, useRef, useEffect } from "react";
import { IoAttachOutline, IoSend } from "react-icons/io5";
import Message from "./Message";
import { useActiveChat } from "../../../context/activeChatContext";

const ChatMain = () => {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const [activeChat, setActiveChat] = useActiveChat();

  useEffect(() => {
    //scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatmain">
      <div className="chatmain-messages">
        {activeChat?.messages?.map((m)=>(
          <Message
          message="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quas illo provident. Dolor fugiat possimus optio error id, ea placeat officiis perferendis omnis reiciendis, odio atque temporibus provident quo asperiores."
          time="1:22am"
          sent={true}
        />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chatmain-sender">
        <IoAttachOutline />
        <input type="text" placeholder="type a message..." />
        <IoSend />
      </div>
    </div>
  );
};

export default ChatMain;
