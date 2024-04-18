import { useEffect, useState } from "react";
import axios from "axios";
import { chunkString } from "../functions/regexFunctions";
export const useLiveMessages = (socket, activeChat, setActiveChat) => {
  const [liveMessages, setLiveMessages] = useState(new Map());
  let receivingFiles = new Map();
  let chunkSize = 500000;
  useEffect(() => {
    const onReceiveMessage = (message) => {
      const { room, format, text, file, timeSent, extension } = message;
      let newLiveMessages = new Map(liveMessages);

      setLiveMessages(
        newLiveMessages.set(room, [
          ...(newLiveMessages.has(room) ? newLiveMessages.get(room) : []),
          { format, sent: false, text, file, timeSent, extension },
        ])
      );
      if (activeChat && activeChat?.room == room) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ? prev.messages : []),
            { format, sent: false, text, file, timeSent, extension },
          ],
          //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date, extension}
        }));
      }
    };
    const onReceiveBuffer = ({ room, timeSent, numberOfChunks, chunk}) => {
      console.log("recieved Event: receive buffer");
      const key = room + timeSent;
      const value = receivingFiles.has(key)
        ? receivingFiles.get(key) + chunk
        : chunk;
      receivingFiles.set(key, value);

      //full file is received
      if (value.length > (numberOfChunks - 1) * chunkSize) {
        onReceiveMessage({
          room,
          format: false,
          text: "",
          file: value,
          timeSent,
        });
      }
    };
    if (socket) {
      socket.on("receive-message", onReceiveMessage);
      socket.on("receive-buffer", onReceiveBuffer);
      return () => {
        socket.off("receive-message");
        socket.off("receive-buffer");
      };
    }
  }, [socket, activeChat?.room]);

  const addLiveMessage = async (
    online,
    room,
    format,
    text,
    file,
    extension,
    timeSent
  ) => {
    if (online) {
      if (format) {
        //true->text
        socket.emit("send-message", {
          room,
          format,
          text,
          file,
          timeSent,
          extension,
        });
      } else {
        let chunks = chunkString(file, chunkSize);
        let numberOfChunks = chunks.length;
        chunks.forEach((chunk) => {
          console.log(chunk);
          socket.emit("send-buffer", { room, timeSent, numberOfChunks, chunk });
        });
      }
    } else {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER}/message/send-message-api`,
          {
            room,
            receiver: activeChat?.c_id,
            text: text || "",
            doc: file || "",
            extension,
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
          { format, sent: true, text, file, timeSent, extension },
        ])
      );
    } else {
      setLiveMessages(
        liveMessages.set(room, [
          { format, sent: true, text, file, timeSent, extension },
        ])
      );
    }
    if (room == activeChat.room) {
      setActiveChat((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { format, sent: true, text, file, timeSent, extension },
        ], //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date, extension}
      }));
    }
  };

  return [liveMessages, addLiveMessage];
};
