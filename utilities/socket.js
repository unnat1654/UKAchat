import { Server } from "socket.io";

//socketio connection

export const socketEvents = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });
  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("send-message", (room, msg) => {
      socket.to(room).emit("receive-message", msg);
    });
    socket.on("join-room", (room) => {
      socket.join(room);
    });
    
  });
};
