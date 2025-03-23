const deepseekAI = require("./deepseek");
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
  const callDeepSeek = async (ballnBlock, room) => {
    if (!ballnBlock[room]) return null; // Return null if room data is missing
  
    // 🚀 Create a copy of the game state WITHOUT the circular reference
    const formattedGameState = {
      room,
      ball: ballnBlock[room].ball,
      bricks: ballnBlock[room].bricks.map((brick) => ({
        brickId: brick.brickId,
      })),
    };
  
    try {
      const response = await deepseekAI(formattedGameState); // ✅ Wait for AI response
      return response; // ✅ Return AI's `paddleX`
    } catch (error) {
      console.error("❌ AI Error:", error);
      return null; // Return null on failure
    }
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
    const ballnBlock = {};
    // Sync ball movement
    socket.on("updateBall", (data) => {
      const { room, x, y, user } = data;
      
      if (!ballnBlock[room]) {
        ballnBlock[room] = { ball: {}, bricks: [] }; // Initialize room storage
      }
    
      ballnBlock[room].ball = { x, y, user };

      if (!ballnBlock[room].aiInterval) {
        // Flag to prevent overlapping AI calls
        let isCallingAI = false;
      
        // Set an interval to call the AI every 1 second
        ballnBlock[room].aiInterval = setInterval(async () => {
          // Skip if a previous call is still in progress
          if (isCallingAI) return;
          
          isCallingAI = true; // Mark as calling
          
          try {
            // Call the AI function and pass in the current game state
            const response = await callDeepSeek(ballnBlock, room);
            
            // If the response contains a valid paddle position, emit it to the frontend
            // console.log(response && response.paddleX !== undefined);
            
            if (response) {
              io.to(room).emit("movePaddle", {
                paddleX: response
              });
            }
          } catch (err) {
            console.error("AI call failed:", err);
          } finally {
            isCallingAI = false; // Reset the flag after the call finishes
          }
        }, 1000); // Repeat every 1 second
      }
    });

    // Sync brick destruction
    socket.on("brickDestroyed", (data) => {
      const { room, user, brickId } = data;
      if (!ballnBlock[room]) {
        ballnBlock[room] = { ball: {}, bricks: [] }; // Initialize room storage
      }
      ballnBlock[room].bricks.push({ brickId });
      callDeepSeek(ballnBlock, room);
      io.to(room).emit("brickDestroyed", {
        brickId: brickId,
        user: user,
      });
    });

    emitRoomList();

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      for (const room of socket.rooms) {
        if (ballnBlock[room] && io.sockets.adapter.rooms.get(room)?.size === 0) {
          clearInterval(ballnBlock[room].aiInterval); // ✅ Stop AI updates
          delete ballnBlock[room].aiInterval;
        }
      }
      emitRoomList();
    });
  });
};
