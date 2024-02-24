export const sendMessage = (socket) => {
  socket.on("send-message", (room, msg) => {
    socket.to(room).emit("receive-message", msg);
  });
};

export const joinRoom = (socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);
  });
};
