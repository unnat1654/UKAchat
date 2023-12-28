import { Server } from "socket.io";
import { sendMessage, joinRoom } from "../controllers/socketController.js";

//socketio connection

export const socketEvents = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });
  io.on("connection", (socket) => {
    console.log(socket.id);
    joinRoom(socket);
    sendMessage(socket);
  });
};
