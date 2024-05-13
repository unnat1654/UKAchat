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

    socket.on("join-room", (payload) => {
      if (payload.roomsArray && payload.roomsArray.length) {
        socket.join(payload.roomsArray);
      }
    });

    socket.on("send-message", (message) => {
      console.log("send-message event occured", JSON.stringify(message));
      socket.to(message.room).emit("receive-message", message);
      //message->{room:"",format:T(text)/F(file),text:"",file:"",timeSent:Date,extension:String}
    });

    socket.on("send-buffer", ({ room, timeSent, numberOfChunks, chunk }) => {
      console.log("send-buffer event occured");
      socket.to(room).emit("receive-buffer", { room, timeSent, numberOfChunks, chunk });
    });

    socket.on("disconnect", async (userId) => {
      await onlineUsers.setOffline(userId);
    });

    socket.on("set-offline", async (token) => {
      const { _id } = JWT.verify(token, process.env.JWT_SECRET);
      console.log(_id);
      await onlineUsers.setOffline(_id);
    });

    socket.on("send-call", (info) => {
      //info={room,offer,username,photo,type}
      socket.to(info.room).emit("incoming-call", info);
      console.log("event received: send-call");
      console.log("event emitted: incoming-call" + JSON.stringify(info));
    });

    socket.on("accept-call", ({ room, ans }) => {
      socket.to(room).emit("call-accepted", { room, ans });
    });

    socket.on("decline-call", (room) => {
      socket.to(room).emit("call-declined", room);
    });


    socket.on("end-unreceived-call",(room)=>{
      console.log("unreceived call cut by caller");
      socket.to(room).emit("incoming-call-ended",room);
    })
    socket.on("end-received-call",(room)=>{
      console.log("ongoingcall cut");
      socket.to(room).emit("call-ended",room);
    })

    socket.on("peer-nego-needed", (roomOffer) => {
      //roomOffer:{room,offer}
      socket.to(roomOffer.room).emit("peer-nego-needed", roomOffer);
    });

    socket.on("peer-nego-done", ({ room, ans }) => {
      socket.to(room).emit("peer-nego-final", ans);
    });
  });
};

export default socketEvents;
