import { Server } from "socket.io";

let io;

export const socketModule = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
      },
    });
    return io;
  },
  getIO: ()=>{
    if(!io){
      throw new Error("Socket.io not initialized");
    }
    return io;
  }
};
