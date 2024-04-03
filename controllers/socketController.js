import onlineUsers from "../helpers/onlineUsers.js";
import { socketModule } from "../config/socket_config.js";
import JWT from "jsonwebtoken";

const socketEvents = () => {
  const io = socketModule.getIO();
  io.on("connection", async (socket) => {
    console.log(socket.id);
    socket.on("handshake", async (payload) => {
      if (!payload?.token) {
        console.log("Not Logged In");
      }
      const { _id } = JWT.verify(payload.token, process.env.JWT_SECRET);
      await onlineUsers.setOnline(_id);
    });
    socket.emit("ping","pong");
    socket.on("join-room", (payload) => {
      if (payload.roomsArray && payload.roomsArray.length) {
        socket.join(payload.roomsArray);
      }
    });

    socket.on("send-message", (message) => {
      console.log("Event Fired: send-message",JSON.stringify(message));
      socket.to(message.room).emit("recieve-message", message);
      console.log("Event Recieved: recieve-message");
      //message->{room:"",format:T(text)/F(file),text:"",file:"",timeSent:Date}
    });

    socket.on("disconnect", async (userId) => {
      await onlineUsers.setOffline(userId);
    });
  });
};

export default socketEvents;
