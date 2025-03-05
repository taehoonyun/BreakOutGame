// BreakoutGame.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { createSocket } from "@/utils/index";
import Canvas from "@/components/CanvasBall";

// Create a single socket instance (consider centralizing socket management for a real app)
const socket: Socket = createSocket();

const BreakoutGame: React.FC = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "";
  const userName = searchParams.get("username") || "defaultUser";
  const [role, setRole] = useState("host");
  // const role = searchParams.get("role") || "guest"; // "host" or "guest"
  const isHost = role === "host";

  // Local state for paddle and ball positions
  const [paddleX, setPaddleX] = useState<number>(0);
  const [serverBall, setServerBall] = useState<{
    serverBallX: number;
    serverBallY: number;
  }>({
    serverBallX: 240,
    serverBallY: 290,
  });

  // On mount, join or create room based on initial URL parameters
  // Listen for role assignment from the server
  useEffect(() => {
    socket.emit("joinRoom", room);
    socket.on("roleAssigned", (assignedRole: string) => {
      setRole(assignedRole);
    });
    return () => {
      socket.off("roleAssigned");
    };
  }, []);

  // Guest: Listen for paddle and ball updates from the server.
  useEffect(() => {
    if (!isHost) {
      const handleMovePaddle = (serverPaddleX: number) => {
        setPaddleX(serverPaddleX);
      };
      const handleUpdateBall = (serverBallX: number, serverBallY: number) => {
        setServerBall({ serverBallX, serverBallY });
      };

      socket.on("movePaddle", handleMovePaddle);
      socket.on("updateBall", handleUpdateBall);
      return () => {
        socket.off("movePaddle", handleMovePaddle);
        socket.off("updateBall", handleUpdateBall);
      };
    }
  }, [isHost, room]);

  return (
    <div className="d-flex">
      <Canvas
        host={isHost}
        room={room}
        userName={userName}
        serverPaddleX={paddleX}
        serverBall={serverBall}
      />
    </div>
  );
};

export default BreakoutGame;
