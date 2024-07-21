/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { PiUploadSimple, PiX } from "react-icons/pi";
import GroupMessageDisplay from "./GroupMessageDisplay";
import { useActiveGroup } from "../../context/activeGroupContext";
import { TbArrowBigRightLinesFilled } from "react-icons/tb";
import axios from "axios";
import CircleLoader from "../loaders/CircleLoader";
import { useSendGroupMessages } from "../../hooks/LiveGroupMessagesHook";
import ManageMembersMenu from "../managegroupmembersmenu/ManageMembersMenu";

const GroupMain = () => {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [activeGroup, setActiveGroup] = useActiveGroup();
  const [typedMessage, setTypedMessage] = useState("");
  const [doc, setDoc] = useState("");
  const [fileName, setFileName] = useState("");
  const [extension, setExtension] = useState("");
  const [pageChanging, setPageChanging] = useState(false);
  const [newScrollHeight, setNewScrollHeight] = useState(0);
  const [toDel, setToDel] = useState(0);
  const [fetchPrev, setFetchPrev] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({ prevPage: 0, currPage: 1 });
  const { addGroupLiveMessage } = useSendGroupMessages(
    activeGroup,
    setActiveGroup,
    page.currPage
  );
  let prevMessageDate = "";

  const fetchPageMessages = async () => {
    try {
      if (page.currPage == 1 && page && page.prevPage == 1) return;
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/group/get-group-messages?group=${
          activeGroup?.group
        }&page=${fetchPrev ? page.currPage : page.prevPage}${
          page.currPage == 1
        }`
      );
      console.log(activeGroup);
      if (data?.success) {
        let displayMessages = [];
        if (page.currPage > page.prevPage) {
          if (fetchPrev) {
            displayMessages = [
              ...data?.messages,
              ...activeGroup?.messages.slice(0, toDel != 0 ? -toDel : 100),
            ];
          } else {
            if (page.currPage == 1) {
              displayMessages = [
                ...activeGroup?.messages.slice(toDel),
                ...data?.messages,
              ];
            } else {
              displayMessages = [
                ...activeGroup?.messages.slice(toDel),
                ...data?.messages,
              ];
            }
          }
          setToDel(data?.messages?.length);
        }
        setActiveGroup((prev) => ({
          ...prev,
          messages: displayMessages,
          totalPages: data?.totalPages,
        }));
        setLoading(false);
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
    if (!activeGroup.group && !doc && !typedMessage) return;
    addGroupLiveMessage(
      activeGroup.group,
      typedMessage != "", //false->file true->text
      typedMessage, //text
      doc, //file
      true,
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
      if (scrollRef.current && scrollRef.current.scrollTop == 0) {
        setFetchPrev(true);
        console.log("length", activeGroup.messages.length);
        console.log(activeGroup);
        const condition1 =
          page.currPage === 1 && activeGroup?.messages?.length >= 100;
        const condition2 =
          page.currPage > 1 &&
          activeGroup?.messages?.length >= 100 &&
          page.currPage != activeGroup?.totalPages;
        const condition = condition1 || condition2;
        if (condition) {
          console.log("if");
          setLoading(true);
          setNewScrollHeight(scrollRef.current.scrollHeight);
          setPage((prev) => ({
            prevPage: prev.currPage,
            currPage: prev.currPage + 1,
          }));
          setPageChanging(true);
        }
      } else if (
        scrollRef.current &&
        scrollRef.current.scrollTop + scrollRef.current.clientHeight >=
          scrollRef.current.scrollHeight - 10
      ) {
        if (page.prevPage >= 1) {
          setLoading(true);
          setFetchPrev(false);
          setPage((prev) => ({
            currPage: prev.prevPage,
            prevPage: prev.prevPage - 1,
          }));
          setPageChanging(true);
        }
      } else {
        setPageChanging(false);
      }
    };
    scrollRef.current?.addEventListener("scroll", handleScroll);

    return () => scrollRef.current?.removeEventListener("scroll", handleScroll);
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
    } else if (fetchPrev) {
      scrollRef.current.scrollTop +=
        newScrollHeight > scrollRef.current.scrollHeight
          ? newScrollHeight - scrollRef.current.scrollHeight - 100
          : scrollRef.current.scrollHeight - newScrollHeight;
    }
  }, [activeGroup.messages]);
  useEffect(() => {
    setTypedMessage("");
    setPage({ prevPage: 0, currPage: 1 });
  }, [activeGroup.group]);

  return (
    <div className="chatmain">
      <div ref={scrollRef} className="chatmain-messages">
        {fetchPrev && loading && (
          <CircleLoader
            color="#008cffa2"
            secondaryColor="white"
            size={"40px"}
          />
        )}
        {activeGroup?.messages?.length &&
          activeGroup?.messages?.map((m) => {
            let DateSent = new Date(m.timeSent).toLocaleDateString("en-GB");
            let condition = false;
            if (DateSent !== prevMessageDate) {
              condition = true;
              prevMessageDate = DateSent;
            }

            return (
              <React.Fragment key={m.timeSent}>
                {condition && <div className="date-tag">{DateSent}</div>}

                <GroupMessageDisplay
                  format={m.format}
                  text={m.text}
                  file={m.file}
                  timeSent={m.timeSent}
                  sent={m.sender == activeGroup?.user}
                  sender={m.sender}
                  extension={m.extension}
                  user={activeGroup?.user}
                />
              </React.Fragment>
            );
          })}
        <ManageMembersMenu show={true} />

        {!fetchPrev && loading && (
          <CircleLoader
            color="#008cffa2"
            secondaryColor="white"
            size={"40px"}
          />
        )}
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

export default GroupMain;
