import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Phaser from "phaser";
import { createSocket } from "@/utils/index";
import { Socket } from "socket.io-client";
import { MainGameSceneAI } from "@/model/MainGameSceneAI";
import { OpponentGameScene } from "@/model/OpponentGameScene";

const socket: Socket = createSocket();

const BreakoutAI: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const opponentGameRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "";
  const userName = searchParams.get("username") || "defaultUser";
  const [role, setRole] = useState("host");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState(1); // Default: 1 player

  useEffect(() => {
    socket.emit("joinRoom", room);
    socket.on("roleAssigned", (assignedRole: string) => {
      setRole(assignedRole);
    });
    // 👥 Listen for player count updates
    socket.on("roomUserCount", (data) => {
      if (data.room === room) {
        setPlayerCount(data.count);
        console.log(`👥 Players in ${room}: ${data.count}`);
      }
    });
    return () => {
      socket.off("roleAssigned");
      socket.off("roomUserCount");
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;

    const mainGame = new Phaser.Game({
      type: Phaser.AUTO,
      width: 400,
      height: 600,
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: new MainGameSceneAI(room, userName, socket, gameOver),
      parent: gameRef.current,
    });

    return () => {
      mainGame.destroy(true);
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <div>
        <h3 style={{ textAlign: "center", color: "white" }}>Your Game</h3>
        <div ref={gameRef} style={{ border: "2px solid white" }}></div>
      </div>
    </div>
  );
};

export default BreakoutAI;
