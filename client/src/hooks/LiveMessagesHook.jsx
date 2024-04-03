import { useEffect, useState } from "react";
export const useLiveMessages = (socket, activeChat, setActiveChat) => {
  const [liveMessages, setLiveMessages] = useState(new Map());
  useEffect(() => {
    const onRecieveMessage = (message) => {
      console.log("Event Recieved: recieve-message");
      const { room, format, text, file, timeSent } = message;
      liveMessages.get(room);
      setLiveMessages(
        liveMessages.set(room, [
          ...(Array.isArray(liveMessages.get(room))
            ? liveMessages.get(room)
            : []),
          { format, sent: false, text, file, timeSent },
        ])
      );
      if (room && room == activeChat?.room) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            { format, sent: false, text, file, timeSent },
          ], //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date,}
        }));
      } else {
        console.log(room);
        console.log(activeChat?.room);
      }
      if (socket) {
        socket.on("recieve-message", onRecieveMessage);

        return () => socket.off("recieve-message");
      }
    };
  }, [socket]);

  const addLiveMessage = (online, room, format, text, file, timeSent) => {
    if (online) {
      socket.emit("send-message", { room, format, text, file, timeSent });
      console.log("Event Fired: send-message");
      //message->{room:"",format:T(text)/F(file),text:"",file:"",timeSent:Date}
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
    } else {
      //TO DO:send message through http
    }
  };

  return [liveMessages, addLiveMessage];
};