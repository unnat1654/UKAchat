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
  const [extension, setExtension] = useState("");
  let todayData = Date.now().toLocaleString();
  let prevMessageDate = "";

  const handleDoc = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "mp4",
        "avi",
        "mov",
        "mp3",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ];
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "video/mp4",
        "video/avi",
        "video/quicktime",
        "audio/mpeg",
        "application/pdf",
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.ms-powerpoint",
      ];

      const fileExtension = file.name.split(".").pop().toLowerCase();
      setExtension(fileExtension);
      // if (
      //   !allowedExtensions.includes(fileExtension) ||
      //   !allowedMimeTypes.includes(file.type)
      // ) {
      //   alert(
      //     "Error: Only images, videos, audios, PDFs, Word, Excel, and PowerPoint files are allowed."
      //   );
      //   setDoc("");
      //   setFileName("");
      //   return;
      // }

      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      console.log(file);
      reader.onloadend = () => {
        setDoc(reader.result);
      };
      setTypedMessage("");
    }
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
      extension,
      Date.now()
    );
    setDoc("");
    setFileName("");
    setTypedMessage("");
    setExtension("");
  };

  const handleKeyDown = (event) => {
    console.log(event);
    if (
      event.keyCode === 13 &&
      (event.target.name === "chatInput" || event.target.name === "fileInput")
    ) {
      if (typedMessage != "" || doc) handleSend();
    }
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
            if (DateSent !== prevMessageDate) {
              condition = true;
              prevMessageDate = DateSent;
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
                  extension={m.extension}
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
          onKeyDown={handleKeyDown}
          name="fileInput"
          accept="*"
          // accept="image/*, video/*, audio/*, application/pdf, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint"
          hidden
        />
        <input
          name="chatInput"
          type="text"
          value={typedMessage}
          onChange={(e) => {
            if (doc) return;
            setTypedMessage(e.target.value);
          }}
          placeholder="type your message..."
          onKeyDown={handleKeyDown}
        />
        <TbArrowBigRightLinesFilled
          onClick={() => {
            if (typedMessage || doc) handleSend();
          }}
        />
      </div>
    </div>
  );
};

export default ChatMain;
