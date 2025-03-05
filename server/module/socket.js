// socket.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    const userName = socket.handshake.query.userId;
    // console.log(`🔌 Socket connected: ${userName}`);

    socket.on("createRoom", (room) => {
      socket.join(room);
    });
    const allRooms = io.sockets.adapter.rooms; // Map<string, Set<string>>
    const connectedSocketIds = new Set(io.sockets.sockets.keys()); // All socket ID

    // actualRooms
    const actualRooms = Array.from(allRooms.keys()).filter(
      (roomId) => !connectedSocketIds.has(roomId)
    );
    io.emit("Rooms", actualRooms);

    // When a user joins a room (e.g., from the room selection page)
    socket.on("joinRoom", (room) => {
      socket.join(room);
      //   console.log(`User: ${socket.id} joined room ${room}`);
      io.to(room).emit("message", `User ${socket.id} has joined the room.`);
    });

    // When a user moves the paddle
    socket.on("movePaddle", (data) => {
      io.to(data.room).emit("movePaddle", data.paddleX);
    });

    // When a user updates the ball's position
    socket.on("updateBall", (room, ball_x, ball_y) => {
      // Data example: { room, ball }
      io.to(room).emit("updateBall", ball_x, ball_y);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
