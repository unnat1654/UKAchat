import { useEffect, useState } from "react";
import axios from "axios";
export const useLiveMessages = (socket, activeChat, setActiveChat) => {
  const [liveMessages, setLiveMessages] = useState(new Map());
  useEffect(() => {
    const onRecieveMessage = (message) => {
      const { room, format, text, file, timeSent } = message;
      let newLiveMessages = new Map(liveMessages);

      if (newLiveMessages.get(room) && newLiveMessages.get(room).length) {
        setLiveMessages(
          newLiveMessages.set(room, [
            ...newLiveMessages.get(room),
            { format, sent: false, text, file, timeSent },
          ])
        );
      } else {
        setLiveMessages(
          newLiveMessages.set(room, [
            { format, sent: false, text, file, timeSent },
          ])
        );
      }
      if (activeChat && activeChat?.room == room) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ? prev.messages : []),
            { format, sent: false, text, file, timeSent },
          ],
          //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date,}
        }));
      }
    };
    if (socket) {
      socket.on("recieve-message", onRecieveMessage);

      return () => socket.off("recieve-message");
    }
  }, [socket, activeChat?.room]);

  const addLiveMessage = async (online, room, format, text, file, timeSent) => {
    if (online) {
      socket.emit("send-message", { room, format, text, file, timeSent });
    } else {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER}/message/send-message-api`,
          {
            room,
            receiver: activeChat?.c_id,
            message: text || "",
            doc: file || "",
            timeSent,
          }
        );
        if (!data?.success) {
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
    const oldMessages = liveMessages.get(room);
    if (oldMessages && oldMessages.length) {
      setLiveMessages(
        liveMessages.set(room, [
          ...oldMessages,
          { format, sent: true, text, file, timeSent },
        ])
      );
    } else {
      setLiveMessages(
        liveMessages.set(room, [{ format, sent: true, text, file, timeSent }])
      );
    }
    if (room == activeChat.room) {
      setActiveChat((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { format, sent: true, text, file, timeSent },
        ], //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date,}
      }));
    }
  };

  return [liveMessages, addLiveMessage];
};
