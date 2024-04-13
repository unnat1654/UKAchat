import React, { useState, useRef, useEffect } from "react";
import { IoAttachOutline, IoSend } from "react-icons/io5";
import MessageDisplay from "./MessageDisplay";
import { useActiveChat } from "../../../context/activeChatContext";

const ChatMain = ({ addLiveMessage }) => {
  const bottomRef = useRef(null);
  const [activeChat, setActiveChat] = useActiveChat();
  const [typedMessage, setTypedMessage] = useState("");

  const handleSend = () => {
    if (!activeChat.room) return;
    if (typedMessage) {
      addLiveMessage(
        activeChat.online,
        activeChat.room,
        true,
        typedMessage,
        "",
        Date.now()
      );
    }
  };

  useEffect(() => {
    //scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  return (
    <div className="chatmain">
      <div className="chatmain-messages">
        {activeChat?.messages?.length &&
          activeChat?.messages?.map((m, i) => (
            <MessageDisplay
              key={i}
              message={m.text}
              time={m.timeSent}
              sent={m.sent}
            />
          ))}
        <div ref={bottomRef} />
      </div>
      <div className="chatmain-sender">
        <IoAttachOutline />
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => {
            setTypedMessage(e.target.value);
          }}
          placeholder="type a message..."
        />
        <IoSend onClick={handleSend} />
      </div>
    </div>
  );
};

export default ChatMain;
