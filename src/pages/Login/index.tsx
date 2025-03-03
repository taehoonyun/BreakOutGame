import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Container, Card, Form, Button } from "react-bootstrap";
import {loginId} from "@/api";
import config from "@/config";

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle form submission
  const onSubmit = (data: any) => {
    // loginId(data.username)
  };

  // Breakout-style animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;
    const ballRadius = 5;

    const drawBall = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateBall = () => {
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      if (ballX <= ballRadius || ballX >= canvas.width - ballRadius) {
        ballSpeedX *= -1;
      }
      if (ballY <= ballRadius || ballY >= canvas.height - ballRadius) {
        ballSpeedY *= -1;
      }
    };

    const animate = () => {
      drawBall();
      updateBall();
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }, []);

  return (
    <div className="position-relative vh-100 d-flex justify-content-center align-items-center">
      {/* Animated Background */}
      <canvas ref={canvasRef} className="position-absolute w-100 h-100" />

      {/* Login Form Container */}
      <Container className="position-relative z-1">
        <Card className="mx-auto p-4 shadow-lg rounded-4 border-0" style={styles.card}>
          <Card.Body>
            <h2 className="text-center mb-4 fw-bold" style={{ color: "#ffffff" }}>
              🔥 Breakout Login
            </h2>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-light">Username</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter username" 
                  {...register("username", { required: "Username is required" })}
                  className="custom-input"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 custom-button">
                Login
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Custom CSS */}
      <style>
        {`
          body {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }
          .custom-input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            transition: all 0.3s ease-in-out;
          }
          .custom-input:focus {
            background: rgba(255, 255, 255, 0.2);
            border-color: white;
            box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.5);
          }
          .custom-button {
            background: linear-gradient(45deg, #ff6b6b, #ff4757);
            border: none;
            transition: all 0.3s ease-in-out;
          }
          .custom-button:hover {
            background: linear-gradient(45deg, #ff4757, #ff6b6b);
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

// Styles
const styles: { card: React.CSSProperties } = {
  card: {
    maxWidth: "400px",
    backdropFilter: "blur(12px)",
    background: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
};

export default Login;
