import React, { useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { createSocket } from "@/utils/index";
type CanvasProps = {
  host: boolean;
  room: string;
  username: string;
};
const socket: Socket = createSocket();

const Canvas: React.FC<CanvasProps> = ({ host, room, username }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game variables
    let ball_x = canvas.width / 2;
    let ball_y = canvas.height - 30;
    let dx = 2;
    let dy = -2;
    const ballRadius = 10;
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;
    // Example brick variables (if needed)
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    let bricks: any = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Update ball position when receiving updates from the server
    if (host) {
      socket.on("updateBall", (serverBallX, serverBallY) => {
        // Update the local ball position to match the server's
        ball_x = serverBallX;
        ball_y = serverBallY;
      });
    }

    // Mouse event for paddle movement
    const mouseMoveHandler = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };
    canvas.addEventListener("mousemove", mouseMoveHandler);

    // Key event to control ball direction (if this client is the designated controller)
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        dx = Math.abs(dx) || 2;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        dx = -Math.abs(dx) || -2;
      }
    };
    window.addEventListener("keydown", keyDownHandler);
    // Draw ball
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ball_x, ball_y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    // Draw Paddle
    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(
        paddleX,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight
      );
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    // Draw Bricks
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

    // collision Detection
    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              ball_x > b.x &&
              ball_x < b.x + brickWidth &&
              ball_y > b.y &&
              ball_y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
            }
          }
        }
      }
    };
    // Game loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off left/right walls
      if (ball_x > canvas.width - ballRadius || ball_x < ballRadius) {
        dx = -dx;
      }
      // Bounce off the top wall
      if (ball_y < ballRadius) {
        dy = -dy;
      } else if (
        ball_x > paddleX &&
        ball_x < paddleX + paddleWidth &&
        ball_y > canvas.height - ballRadius - paddleHeight &&
        ball_y < canvas.height - 15
      ) {
        // Calculate bounce angle on paddle hit
        const relativeIntersectX = ball_x - (paddleX + paddleWidth / 2);
        const normalizedRelativeIntersectionX =
          relativeIntersectX / (paddleWidth / 2);
        const bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 3);
        const speed = Math.sqrt(dx * dx + dy * dy);
        dx = speed * Math.sin(bounceAngle);
        dy = -speed * Math.cos(bounceAngle);
      }

      // Update ball position (only if this client is designated as the controller)
      // You may want to decide based on a flag or role:
      ball_x += dx;
      ball_y += dy;

      // Emit the updated ball position to the server
      if (host) {
        socket.emit("updateBall", room, ball_x, ball_y);
      }

      requestAnimationFrame(draw);
    };
    draw();
    return () => {
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

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
