import React, { useState,useEffect} from "react";
import { TbArrowBigRightLinesFilled } from "react-icons/tb";
import { PiUploadSimple, PiX } from "react-icons/pi";
import { useActiveChat } from "../../context/activeChatContext";
import { encrypt } from "../../functions/encryptionFunctions";
import { useSocket } from "../../context/socketContext";
import { useContactDetailsArray } from "../../context/ContactDetailsContext";
import { useSendMessages } from "../../hooks/LiveMessagesHook";

const MessageSender = ({sharedKey,page}) => {
  
  const [typedMessage, setTypedMessage] = useState("");
  const [doc, setDoc] = useState("");
  const [fileName, setFileName] = useState("");
  const [extension, setExtension] = useState("");
  const [contactDetailsArray,setContactDetailsArray]=useContactDetailsArray();
  const [activeChat, setActiveChat] = useActiveChat();

  const socket = useSocket();
  const addLiveMessage = useSendMessages(
    socket,
    activeChat,
    setActiveChat,
    page,
    contactDetailsArray,
    setContactDetailsArray
  );

  const handleDoc = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      setExtension(fileExtension);
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
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
    setExtension("");
  };

  const handleSend = async () => {
    if (!activeChat.room && !doc && !typedMessage) return;
    if (typedMessage) {
      const { cipherText, iv } = await encrypt(sharedKey, typedMessage);
      addLiveMessage(
        activeChat.online,
        activeChat.room,
        typedMessage != "", //false->file true->text
        cipherText, //text
        iv,
        doc, //file
        extension,
        Date.now()
      );
    } else {
      addLiveMessage(
        activeChat.online,
        activeChat.room,
        typedMessage != "", //false->file true->text
        "", //text
        "", //iv
        doc, //file
        extension,
        Date.now()
      );
    }

    setDoc("");
    setFileName("");
    setTypedMessage("");
    setExtension("");
  };

  const handleKeyDown = (e) => {
    if (
      e.keyCode === 13 &&
      (e.target.name === "chatInput" || e.target.name === "fileInput")
    ) {
      if (typedMessage != "" || doc) handleSend();
    }
  };
  useEffect(() => {
    setTypedMessage("");
  }, [activeChat.room]);

  return (
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
  );
};

export default MessageSender;
