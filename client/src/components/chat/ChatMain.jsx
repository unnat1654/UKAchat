import React, { useState, useRef, useEffect } from "react";
import { PiUploadSimple, PiX } from "react-icons/pi";
import MessageDisplay from "./MessageDisplay";
import { useActiveChat } from "../../context/activeChatContext";
import { TbArrowBigRightLinesFilled } from "react-icons/tb";
import axios from "axios";
import {
  getLSMsgTimeRange,
  getRoomLSMessages,
} from "../../functions/localStorageFunction";

const ChatMain = ({ addLiveMessage }) => {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [activeChat, setActiveChat] = useActiveChat();
  const [typedMessage, setTypedMessage] = useState("");
  const [doc, setDoc] = useState("");
  const [fileName, setFileName] = useState("");
  const [extension, setExtension] = useState("");
  let todayDate = Date.now().toLocaleString();
  const [page, setPage] = useState({ prevPage: 0, currPage: 1 });
  const [pageChanging, setPageChanging] = useState(false);
  let prevMessageDate = "";

  const fetchPageMessages = async () => {
    try {
      const [firstTime, lastTime] = getLSMsgTimeRange(activeChat.room);
      console.log("fetchPageMessages ran");
      if (page.currPage == 1 && page && page.prevPage == 1) return;
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/message/get-messages?room=${
          activeChat?.room
        }&page=${page.currPage}${
          page.currPage == 1
            ? `&firstTime=${firstTime}&lastTime=${lastTime}`
            : ""
        }`
      );
      if (data?.success) {
        let displayMessages = [];
        if (page.currPage > page.prevPage) {
          displayMessages = [
            ...data?.messages,
            ...activeChat?.messages.slice(0, 100),
          ];
        } else if (page.currPage < page.prevPage) {
          displayMessages = [
            ...activeChat?.messages.slice(-101, -1),
            ...data?.messages,
            ...getRoomLSMessages(activeChat?.room, page.currPage == 1),
          ];
        }
        console.log("ac ", activeChat);
        console.log("dm ", displayMessages);
        setActiveChat((prev) => ({
          ...prev,
          messages: displayMessages.slice(0, 100),
          totalPages: data?.totalPages,
        }));
        if (
          scrollRef.current.scrollTop + scrollRef.current.clientHeight !=
          scrollRef.current.scrollHeight
        ) {
          scrollRef.current.scrollTop =
            scrollRef.current.scrollHeight -
            scrollRef.current.clientHeight -
            100;
        } else {
          scrollRef.current.scrollTop = scrollRef.current.clientHeight - 100;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
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

  const handleKeyDown = (e) => {
    if (
      e.keyCode === 13 &&
      (e.target.name === "chatInput" || e.target.name === "fileInput")
    ) {
      if (typedMessage != "" || doc) handleSend();
    }
  };

  useEffect(() => {
    const handleScroll = async () => {
      console.log(
        "ScrollTop:" +
          scrollRef.current.scrollTop +
          "\nScrollHeight:" +
          scrollRef.current.scrollHeight +
          "\nclientHeight:" +
          scrollRef.current.clientHeight
      );

      if (scrollRef.current.scrollTop == 0) {
        console.log("length", activeChat.messages.length);
        console.log(activeChat);
        const condition1 =
          page.currPage === 1 && activeChat?.messages?.length >= 100;
        const condition2 =
          page.currPage > 1 &&
          activeChat?.messages?.length === 100 &&
          page.currPage != activeChat?.totalPages;
        const condition = condition1 || condition2;
        console.log("c1", condition1);
        console.log("c2", condition2);
        console.log(condition);
        if (condition) {
          console.log("if");
          setPage((prev) => ({
            prevPage: prev.currPage,
            currPage: prev.currPage + 1,
          }));
          setPageChanging(true);
        }
      } else if (
        scrollRef.current.scrollTop + scrollRef.current.clientHeight ==
        scrollRef.current.scrollHeight
      ) {
        if (page.prevPage >= 1) {
          console.log("1234");
          setPage((prev) => ({
            currPage: prev.prevPage,
            prevPage: prev.prevPage - 1,
          }));
          setPageChanging(true);
        }
        // } else if (
        //   scrollRef.current.scrollTop + scrollRef.current.clientHeight >
        //   scrollRef.current.scrollHeight * 0.93
        // ) {
        //   if (page.prevPage > 1) {
        //     setPage((prev) => ({
        //       prevPage: prev.currPage,
        //       currPage: prev.prevPage - 1,
        //     }));
        //     setPageChanging(true);
        //   }
      } else {
        setPageChanging(false);
      }
    };
    scrollRef.current.addEventListener("scroll", handleScroll);

    return () => scrollRef.current.removeEventListener("scroll", handleScroll);
  }, [scrollRef.current && scrollRef.current.scrollTop]);

  useEffect(() => {
    if (pageChanging) {
      fetchPageMessages();
    }
  }, [pageChanging]);

  useEffect(() => {
    //scroll to bottom every time messages change except when old messages are loaded
    if (!pageChanging) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat.messages]);
  useEffect(() => {
    setTypedMessage("");
    setPage({ prevPage: 0, currPage: 1 });
  }, [activeChat.room]);

  return (
    <div className="chatmain">
      <div ref={scrollRef} className="chatmain-messages">
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
        {JSON.stringify(page)}
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
