/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect, useCallback } from "react";
import MessageDisplay from "./MessageDisplay";
import { useActiveChat } from "../../context/activeChatContext";
import axios from "axios";
import {
  getLSMsgTimeRange,
  getRoomLSMessages,
} from "../../functions/localStorageFunction";
import CircleLoader from "../loaders/CircleLoader";
import { useSharedKey } from "../../hooks/sharedKeyHook";
import MessageSender from "./MessasgeSender";

const ChatMain = () => {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [activeChat, setActiveChat] = useActiveChat();
  const sharedKey = useSharedKey(activeChat);
  const [page, setPage] = useState({ prevPage: 0, currPage: 1 });

  const [pageChanging, setPageChanging] = useState(false);
  const [newScrollHeight, setNewScrollHeight] = useState(0);
  const [toDel, setToDel] = useState(0);
  const [fetchPrev, setFetchPrev] = useState(true);
  const [loading, setLoading] = useState(false);

  let prevMessageDate = "";

  const fetchPageMessages = useCallback(async () => {
    try {
      const [firstTime, lastTime] = getLSMsgTimeRange(activeChat.room);
      if (page.currPage == 1 && page && page.prevPage == 1) return;
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/message/get-messages?room=${
          activeChat?.room
        }&page=${fetchPrev ? page.currPage : page.prevPage}${
          page.currPage == 1
            ? `&firstTime=${firstTime}&lastTime=${lastTime}`
            : ""
        }`
      );
      if (data?.success) {
        let displayMessages = [];
        if (page.currPage > page.prevPage) {
          if (fetchPrev) {
            displayMessages = [
              ...data?.messages,
              ...activeChat?.messages.slice(0, toDel != 0 ? -toDel : 100),
            ];
          } else {
            if (page.currPage == 1) {
              displayMessages = [
                ...activeChat?.messages.slice(toDel),
                ...data?.messages,
                ...getRoomLSMessages(activeChat?.room, page.currPage == 1),
              ];
            } else {
              displayMessages = [
                ...activeChat?.messages.slice(toDel),
                ...data?.messages,
              ];
            }
          }
          setToDel(data?.messages?.length);
        }
        setActiveChat((prev) => ({
          ...prev,
          messages: displayMessages,
          totalPages: data?.totalPages,
        }));
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  },[pageChanging]);

  const handleScroll = useCallback(async () => {
    if (scrollRef.current && scrollRef.current.scrollTop == 0) {
      setFetchPrev(true);
      const condition1 =
        page.currPage === 1 && activeChat?.messages?.length >= 100;
      const condition2 =
        page.currPage > 1 &&
        activeChat?.messages?.length >= 100 &&
        page.currPage != activeChat?.totalPages;
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
  },[scrollRef.current && scrollRef.current.scrollTop]);
  
  useEffect(() => {
    scrollRef.current?.addEventListener("scroll", handleScroll);
    return () => scrollRef.current?.removeEventListener("scroll", handleScroll);
  }, [scrollRef.current && scrollRef.current.scrollTop]);

  
  useEffect(() => {
    setPage({ prevPage: 0, currPage: 1 });
  }, [activeChat.room]);

  useEffect(() => {
    if (pageChanging) {
      fetchPageMessages();
    }
  }, [fetchPageMessages]);

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
  }, [activeChat.messages]);


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
        {activeChat?.messages?.length &&
          activeChat?.messages?.map((m) => {
            let DateSent = new Date(m.timeSent).toLocaleDateString("en-GB");
            let showDateCondition = false;
            if (DateSent !== prevMessageDate) {
              showDateCondition = true;
              prevMessageDate = DateSent;
            }

            return (
              <React.Fragment key={m.timeSent}>
                {showDateCondition && (
                  <div className="date-tag">{DateSent}</div>
                )}

                <MessageDisplay
                  format={m.format}
                  text={m.text}
                  file={m.file}
                  timeSent={m.timeSent}
                  sent={m.sent}
                  extension={m.extension}
                  iv={m.iv}
                  sharedKey={sharedKey}
                />
              </React.Fragment>
            );
          })}
        {!fetchPrev && loading && (
          <CircleLoader
            color="#008cffa2"
            secondaryColor="white"
            size={"40px"}
          />
        )}
        <div ref={bottomRef} />
      </div>
      <MessageSender sharedKey={sharedKey} page={page.currPage}/>
    </div>
  );
};

export default ChatMain;
