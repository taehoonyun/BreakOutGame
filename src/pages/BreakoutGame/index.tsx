import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { createSocket } from "@/utils/index";
import Canvas from "@/components/Canvas";

// Create a single socket instance
const socket: Socket = createSocket();

const BreakoutGame: React.FC = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "";
  const username = searchParams.get("username") || "defaultUser";
  // A query parameter 'host' should be "true" for the first (host) user
  const isHost = searchParams.get("host") === "true";

  useEffect(() => {
    if (isHost) {
      // The first user creates the room
      socket.emit("createRoom", room);
    } else {
      // Subsequent users just join the room
      socket.emit("joinRoom", room);
    }

    // Clean up if needed
    return () => {
      socket.off("message");
    };
  }, [isHost, room]);

  return (
    <div className="d-flex">
      {/* Pass the host flag and room/username info as props */}
      <Canvas host={isHost} room={room} username={username} />
      <Canvas host={!isHost} room={room} username={username} />
    </div>
  );
};

export default BreakoutGame;
