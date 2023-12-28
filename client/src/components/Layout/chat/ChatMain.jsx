import React, { useState, useRef, useEffect } from "react";
import { IoAttachOutline, IoSend } from "react-icons/io5";
import Message from "./message";

const ChatMain = () => {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="chatmain">
      <div className="chatmain-messages">
        <Message
          message="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quas illo provident. Dolor fugiat possimus optio error id, ea placeat officiis perferendis omnis reiciendis, odio atque temporibus provident quo asperiores."
          time="1:22am"
          sent={true}
        />
        <Message
          message="Lorem ipsum dolor sit amet consectetur"
          time="1:23am"
          sent={true}
        />
        <Message
          message="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quas illo provident."
          time="1:30am"
          sent={false}
        />
        <Message
          message="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quas illo provident. Dolor fugiat possimus optio error id, ea placeat officiis perferendis omnis reiciendis, odio atque temporibus provident quo asperiores."
          time="1:22am"
          sent={true}
        />
        <Message
          message="Lorem ipsum dolor sit amet consectetur"
          time="1:23am"
          sent={true}
        />
        <Message
          message="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quas illo provident."
          time="1:30am"
          sent={false}
        />
        <Message message="." time="1:23am" sent={true} />
        <Message message="." time="1:23am" sent={false} />
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
