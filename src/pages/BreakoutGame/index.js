import React, { useRef, useEffect } from "react";

const BreakoutGame = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 게임 변수
    let ball_x = canvas.width / 2;
    let ball_y = canvas.height - 30;

    let dx = 2;
    let dy = -2;
    const ballRadius = 10;
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // 벽돌 설정
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    let bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // 마우스 이벤트 핸들러: 패들 이동
    const mouseMoveHandler = (e) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };
    canvas.addEventListener("mousemove", mouseMoveHandler);
    
    // Control the ball
    const keyDownHandler = (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        dx = Math.abs(dx) || 2; // Ensure dx is positive
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        dx = -Math.abs(dx) || -2; // Ensure dx is negative
      }
    };
    window.addEventListener("keydown", keyDownHandler);
    // 공 그리기
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ball_x, ball_y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    // 패들 그리기
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

    // 벽돌 그리기
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

    // 충돌 검사
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
    // 게임 루프
    // debounce를 위한 타이머 ID를 draw 함수 외부에 선언
    let bounceTimeoutId = null;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // 공의 벽 충돌 처리 (좌우)
      if (ball_x > canvas.width - ballRadius || ball_x < ballRadius) {
        dx = -dx;
      }
      // 천장 충돌 처리
      if (ball_y < ballRadius) {
        dy = -dy;
      } else if (ball_x > paddleX && ball_x < paddleX + paddleWidth) {
        // 패들과 충돌 시
        if (
          ball_y > canvas.height - ballRadius - paddleHeight &&
          ball_y < canvas.height - 15
        ) {
          // 패들의 중앙 기준 공 충돌 처리 (여기서 원하는 각도 계산 로직 추가 가능)
          let relativeIntersectX = ball_x - (paddleX + paddleWidth / 2);
          let normalizedRelativeIntersectionX =
            relativeIntersectX / (paddleWidth / 2);
          let bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 3);

          // 공의 속도를 일정하게 유지하면서 x, y 속도를 재계산하는 예시
          let speed = Math.sqrt(dx * dx + dy * dy);
          dx = speed * Math.sin(bounceAngle);
          dy = -speed * Math.cos(bounceAngle);
        }
      }
      ball_x += dx;
      ball_y += dy;
      requestAnimationFrame(draw);
    };

    draw();

    // 컴포넌트 언마운트 시 이벤트 제거
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

export default BreakoutGame;
