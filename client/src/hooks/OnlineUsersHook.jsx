import { useCallback, useEffect, useState } from "react";

export const useOnlineUsers = (socket) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  const getOnlineUsers = useCallback((onlineContacts) => {
    console.log(onlineContacts);
    if (!onlineContacts) return;
    setOnlineUsers(onlineContacts);
  }, []);

  const newContactOnline = useCallback(
    (c_id) => {
      console.log(`Server notification: new contact online: ${c_id}`);
      if (onlineUsers?.includes(c_id)) return;
      setOnlineUsers([...onlineUsers, c_id]);
    },
    [onlineUsers]
  );

  const newContactOffline = useCallback(
    (c_id) => {
      console.log(`Server notification: new contact offline: ${c_id}`);
      if (!onlineUsers) return;
      setOnlineUsers(onlineUsers?.filter((user) => user !== c_id));
    },
    [onlineUsers]
  );

  useEffect(() => {
    if (socket) {
      socket.on("get-online-contacts", getOnlineUsers);
      socket.on("new-contact-online", newContactOnline);
      socket.on("one-contact-went-offline", newContactOffline);
      return () => {
        socket.off("get-online-contacts", getOnlineUsers);
        socket.off("new-contact-online", newContactOnline);
        socket.off("one-contact-went-offline", newContactOffline);
      };
    }
  }, [socket, onlineUsers]);

  return onlineUsers;
};
