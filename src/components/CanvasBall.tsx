// CanvasBall.tsx
import React, { useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { createSocket } from "@/utils/index";

type CanvasProps = {
  host: boolean;
  room: string;
  userName: string;
  serverPaddleX: number;
  serverBall: { serverBallX: number; serverBallY: number };
};

// Create a single socket instance (consider centralizing this in your app)
const socket: Socket = createSocket();

const Canvas: React.FC<CanvasProps> = ({
  host,
  room,
  userName,
  serverPaddleX,
  serverBall,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for paddle and ball positions
  const paddleXRef = useRef<number>(serverPaddleX);
  const ballRef = useRef<{ x: number; y: number }>({
    x: serverBall.serverBallX || 240,
    y: serverBall.serverBallY || 290,
  });

  // Update paddle ref when serverPaddleX prop changes
  useEffect(() => {
    paddleXRef.current = serverPaddleX;
  }, [serverPaddleX]);

  // Update ball ref when serverBall prop changes (for non-host clients)
  useEffect(() => {
    ballRef.current = { x: serverBall.serverBallX, y: serverBall.serverBallY };
  }, [serverBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ball and paddle configuration
    let dx = 2;
    let dy = -2;
    const ballRadius = 10;
    const paddleHeight = 10;
    const paddleWidth = 75;
    let lastEmitTime = 0;
    const emitInterval = 100; // ms throttle for ball updates

    // Brick setup
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const bricks: any = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // For guest clients: listen for server updates
    socket.on("updateBall", (x: number, y: number) => {
      if (!host) {
        ballRef.current = { x, y };
      }
    });
    socket.on("updatePaddle", (updatedPaddleX: number) => {
      if (!host) {
        paddleXRef.current = updatedPaddleX;
      }
    });

    // Host-only: mouse event for paddle control
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!host) return;
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        const newPaddleX = relativeX - paddleWidth / 2;
        paddleXRef.current = newPaddleX;
        socket.emit("movePaddle", { room, paddleX: newPaddleX });
      }
    };
    if (host) canvas.addEventListener("mousemove", mouseMoveHandler);

    // Host-only: key event for ball control
    const keyDownHandler = (e: KeyboardEvent) => {
      if (!host) return;
      if (e.key === "Right" || e.key === "ArrowRight") {
        dx = Math.abs(dx) || 2;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        dx = -Math.abs(dx) || -2;
      }
    };
    if (host) window.addEventListener("keydown", keyDownHandler);

    // Drawing functions
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(
        paddleXRef.current,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight
      );
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              ballRef.current.x > b.x &&
              ballRef.current.x < b.x + brickWidth &&
              ballRef.current.y > b.y &&
              ballRef.current.y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
            }
          }
        }
      }
    };

    // Main game loop
    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off walls
      if (
        ballRef.current.x > canvas.width - ballRadius ||
        ballRef.current.x < ballRadius
      ) {
        dx = -dx;
      }
      if (ballRef.current.y < ballRadius) {
        dy = -dy;
      } else if (
        ballRef.current.x > paddleXRef.current &&
        ballRef.current.x < paddleXRef.current + paddleWidth &&
        ballRef.current.y > canvas.height - ballRadius - paddleHeight &&
        ballRef.current.y < canvas.height - 15
      ) {
        dy = -dy;
      }

      // Host-only: update ball position and emit updates
      if (host) {
        ballRef.current.x += dx;
        ballRef.current.y += dy;
        const now = Date.now();
        if (now - lastEmitTime > emitInterval) {
          socket.emit("updateBall", room, ballRef.current.x, ballRef.current.y);
          lastEmitTime = now;
        }
      }
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Cleanup on unmount
    return () => {
      if (host) {
        canvas.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("keydown", keyDownHandler);
      }
      socket.off("updateBall");
      socket.off("updatePaddle");
    };
  }, [room, host]);

  return (
    <canvas
      ref={canvasRef}
      width="480"
      height="320"
      style={{ background: "#eee", display: "block", margin: "0 auto" }}
    />
  );
};

export default Canvas;
