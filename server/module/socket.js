// socket.js
module.exports = (io) => {
  // Helper function to calculate and emit the list of actual rooms
  const emitRoomList = () => {
    const allRooms = io.sockets.adapter.rooms; // Map<string, Set<string>>
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
      // 🔢 Get the number of users in the room
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

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
      // 📢 Notify all clients in the room about the updated count
      io.to(room).emit("roomUserCount", { room, count: roomSize });
      emitRoomList();
    });

    // Sync paddle movement
    socket.on("movePaddle", (data) => {
      io.to(data.room).emit("movePaddle", {
        paddleX: data.paddleX,
        user: data.user,
      });
    });

    // Sync ball movement
    socket.on("updateBall", (data) => {
      io.to(data.room).emit("updateBall", data);
    });

    // Sync brick destruction
    socket.on("brickDestroyed", (data) => {
      io.to(data.room).emit("brickDestroyed", data);
    });

    emitRoomList();

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      emitRoomList();
    });
  });
};
