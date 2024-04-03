import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const socketContext = createContext();

export const useSocket = () => {
  return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const LSAuth = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    if (LSAuth?.token) {
      const newSocket = io("http://localhost:8080", {
        transports: ["websocket"],
      });
      newSocket.emit("handshake", { token: LSAuth?.token });
      setSocket(newSocket);
      return () => newSocket.close()
    }
  }, [LSAuth?.token]);

  return (
    <socketContext.Provider value={socket}>{children}</socketContext.Provider>
  );
};
