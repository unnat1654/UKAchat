import React, { useState, useRef, useEffect } from "react";
import { PiUploadSimple, PiX } from "react-icons/pi";
import MessageDisplay from "./MessageDisplay";
import { useActiveChat } from "../../../context/activeChatContext";
import { TbArrowBigRightLinesFilled } from "react-icons/tb";

const ChatMain = ({ addLiveMessage }) => {
  const bottomRef = useRef(null);
  const [activeChat, setActiveChat] = useActiveChat();
  const [typedMessage, setTypedMessage] = useState("");
  const [doc, setDoc] = useState("");
  const [fileName, setFileName] = useState("");
  // const [prevMessageDate, setPrevMessageDate] = useState("");
  let todayData=Date.now().toLocaleString();
  let prevMessageDate = "";

  const handleDoc = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    console.log(file);
    reader.onloadend = () => {
      setDoc(reader.result);
    };
    setTypedMessage("");
  };

  const removeFile = (e) => {
    e.preventDefault();
    setDoc("");
    setFileName("");
  };

  const handleSend = () => {
    if (!activeChat.room && !doc && !typedMessage) return;
    addLiveMessage(
      activeChat.online,
      activeChat.room,
      typedMessage != "", //false->file true->text
      typedMessage, //text
      doc, //file
      Date.now()
    );
    setDoc("");
    setFileName("");
    setTypedMessage("");
  };

  useEffect(() => {
    //scroll to bottom every time messages change
    console.log("useEffect to bring message to bottom ran");
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);
  useEffect(() => {
    console.log("useEffect to set typed message blank ran");
    setTypedMessage("");
  }, [activeChat.room]);

  return (
    <div className="chatmain">
      <div className="chatmain-messages">
        {activeChat?.messages?.length &&
          activeChat?.messages?.map((m) => {
            let DateSent = new Date(m.timeSent).toLocaleDateString("en-GB");
            let condition = false;
            console.log(DateSent);
            if (DateSent !== prevMessageDate) {
              condition = true;
              // setPrevMessageDate(DateSent);
              prevMessageDate = DateSent;
              console.log(DateSent);
            }

            return (
              <React.Fragment key={m.timeSent}>
                {condition && <div className="date-tag">{DateSent}</div>}

                <MessageDisplay
                  format={m.format}
                  text={m.text}
                  file={m.file}
                  timeSent={m.timeSent}
                  sent={m.sent}
                />
              </React.Fragment>
            );
          })}
        <div ref={bottomRef} />
      </div>
      <div className="chatmain-sender">
        <label htmlFor="upload-file">
          {doc ? (
            <>
              <PiX className="close-file" onClick={removeFile} />
              <span className="upload-file-name">
                {fileName.length > 12
                  ? `${fileName.slice(0, 8)}...${fileName.split(".").pop()}`
                  : fileName}
              </span>
            </>
          ) : (
            <PiUploadSimple />
          )}
        </label>
        <input
          type="file"
          id="upload-file"
          onChange={handleDoc}
          accept="*"
          hidden
        />
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => {
            if (doc) return;
            setTypedMessage(e.target.value);
          }}
          placeholder="type your message..."
        />
        <TbArrowBigRightLinesFilled onClick={handleSend} />
      </div>
    </div>
  );
};

export default ChatMain;
