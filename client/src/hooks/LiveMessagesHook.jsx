import { useEffect } from "react";
import axios from "axios";
import { chunkString } from "../functions/regexFunctions";
import {
  addMessageToLocalStorage,
  roomSaveOldMessages,
} from "../functions/localStorageFunction";

export const useSendMessages = (socket, activeChat, setActiveChat, page) => {
  let receivingFiles = new Map();
  let chunkSize = 500000;
  useEffect(() => {
    const onReceiveMessage = (message) => {
      const { room, format, text, iv, file, timeSent, extension } = message;
      addMessageToLocalStorage(room, {
        format,
        sent: false,
        text,
        iv,
        file,
        extension,
        timeSent,
      });
      if (activeChat && activeChat?.room == room && page <= 2) {
        console.log(page);
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ? prev.messages : []),
            { format, sent: false, text, iv, file, timeSent, extension },
          ],
          //format {format:bool(F for file:T for text), sent:bool, text:"",iv:"", file:link, timeSent:Date, extension}
        }));
      }
    };
    const onReceiveBuffer = ({ room, timeSent, numberOfChunks, chunk }) => {
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
          iv: "",
          file: value,
          timeSent,
        });
        receivingFiles.delete(key);
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
    iv,
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
          iv,
          file,
          timeSent,
          extension,
        });
      } else {
        let chunks = chunkString(file, chunkSize);
        let numberOfChunks = chunks.length;
        chunks.forEach((chunk) => {
          socket.emit("send-buffer", { room, timeSent, numberOfChunks, chunk });
        });
      }
      addMessageToLocalStorage(room, {
        format,
        sent: true,
        text: text ? text : "",
        iv: text ? iv : "",
        file: file ? file : "",
        extension: extension ? extension : "",
        timeSent,
      });
    } else {
      try {
        const response = await roomSaveOldMessages(room);
        if (response?.success != true) {
          throw new Error("Error while saving old messages");
        }
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER}/message/send-message-api`,
          {
            room,
            text: text || "",
            iv: iv || "",
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
    if (room == activeChat.room && page <= 2) {
      setActiveChat((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { format, sent: true, text, iv, file, timeSent, extension },
        ], //format {format:bool(F for file:T for text), sent:bool, text:"", iv:"", file:link, timeSent:Date, extension}
      }));
    }
  };

  return addLiveMessage;
};
