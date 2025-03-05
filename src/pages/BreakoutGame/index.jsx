import React, { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { createSocket } from "@/utils/index";
import Canvas from "@/components/Canvas";
const socket = createSocket();

const BreakoutGame = () => {
  // const canvasRef1 = useRef(null);
  // const canvasRef2 = useRef(null);
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const username = searchParams.get("username");

  useEffect(() => {
    // Emit a join event to the server (if not already done in the hook)
    socket.emit("createRoom", room);

    // // Example: Listen for a message event
    // socket.on("message", (msg) => {
    //   console.log("Received message:", msg);
    // });

    // Cleanup event listeners on unmount
    return () => {
      socket.off("message");
    };
  }, [socket, room]);

  return (
    <div className="d-flex">
      <Canvas/>
      <Canvas/>
    </div>
  );
};

export default BreakoutGame;
