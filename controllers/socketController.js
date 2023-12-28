export const sendMessage = (socket) => {
  socket.on("send-message", (room, msg) => {
    socket.to(room).emit("recieve-message", msg);
  });
};

export const joinRoom = (socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);
  });
};
