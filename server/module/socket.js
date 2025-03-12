// socket.js
module.exports = (io) => {
  // Helper function to calculate and emit the list of actual rooms
  const emitRoomList = () => {
    const allRooms = io.sockets.adapter.rooms; // Map<string, Set<string>>
    console.log(allRooms);
    
    const connectedSocketIds = new Set(io.sockets.sockets.keys());
    const actualRooms = Array.from(allRooms.keys()).filter(
      (roomId) => !connectedSocketIds.has(roomId)
    );
    io.emit("Rooms", actualRooms);
  };

  io.on("connection", (socket) => {
    const userName = socket.handshake.query.userId;
    console.log(`🔌 Socket connected: ${socket.id} (${userName})`);

    // When a client joins a room, check for existing host.
    socket.on("joinRoom", (room) => {
      socket.join(room);
      const roomSockets = io.sockets.adapter.rooms.get(room);

      let hostExists = false;
      if (roomSockets) {
        roomSockets.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.data.role === "host") {
            hostExists = true;
          }
        });
      }
      socket.data.role = hostExists ? "guest" : "host";
      // Emit a single event with role and username info
      socket.emit("roomJoined", {
        role: socket.data.role,
        userName: socket.data.userName,
      });
      io.to(room).emit(
        "message",
        `User ${socket.id} has joined the room as ${socket.data.role}.`
      );
      socket.emit("roleAssigned", socket.data.role);
      emitRoomList();
    });

    // Relay paddle movements
    socket.on("movePaddle", (data) => {
      // data: { room, paddleX, userName }
      io.to(data.room).emit("movePaddle", data.paddleX);
    });

    // Relay ball updates
    socket.on("updateBall", (room, ball_x, ball_y) => {
      io.to(room).emit("updateBall", ball_x, ball_y);
    });

    emitRoomList();

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      emitRoomList();
    });
  });
};
