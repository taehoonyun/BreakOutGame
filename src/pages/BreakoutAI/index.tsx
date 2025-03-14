import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Phaser from "phaser";
import { createSocket } from "@/utils/index";
import { Socket } from "socket.io-client";
import { MainGameScene } from "@/model/MainGameScene";
import { OpponentGameScene } from "@/model/OpponentGameScene";
import { getapi } from "@/api";

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
  
 async function main() {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello, how are you?" },
    ];

    try {
      const response = await getapi(messages);
      // const response = await fetch("http://localhost:5000/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ messages }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to fetch response from server");
      // }

      console.log(response); // Log the assistant's response
    } catch (error) {
      console.error("Error:", error);
    }
  }
  useEffect(() => {
      main();
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
    if (!gameRef.current || !opponentGameRef.current) return;

    const mainGame = new Phaser.Game({
      type: Phaser.AUTO,
      width: 400,
      height: 600,
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: new MainGameScene(room, userName, socket, gameOver),
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
