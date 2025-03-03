// socket.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    const userName = socket.handshake.query.username;
    console.log(`🔌 Socket connected: ${userName}`);

    socket.on("createRoom", (room) => {
      socket.join(room);
      console.log(`User: ${userName} joined room ${room}`);
      io.to(room).emit("message", `User ${userName} has created the room.`);
    });
    // When a user joins a room (e.g., from the room selection page)
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`User: ${socket.id} joined room ${room}`);
      io.to(room).emit("message", `User ${socket.id} has joined the room.`);
    });

    // When a user moves the paddle
    socket.on("movePaddle", (data) => {
      // Data example: { room, position }
      console.log(
        `Paddle moved in room ${data.room} to position ${data.position}`
      );
      io.to(data.room).emit("updatePaddle", data.position);
    });

    // When a user updates the ball's position
    socket.on("updateBall", (data) => {
      // Data example: { room, ball }
      console.log(`Ball updated in room ${data.room}`, data.ball);
      io.to(data.room).emit("updateBall", data.ball);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
