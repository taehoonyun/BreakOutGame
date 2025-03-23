import Phaser from "phaser";
import { Socket } from "socket.io-client";
import { getAIResponse } from "@/api";

export class MainGameSceneAI extends Phaser.Scene {
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.Physics.Arcade.StaticGroup;
  private room: string;
  private userName: string;
  private socket: Socket;
  private gameOver: boolean = false; // Track game state
  private ballUpdateInterval!: NodeJS.Timeout; // Store interval reference

  constructor(
    room: string,
    userName: string,
    socket: Socket,
    gameOver: boolean
  ) {
    super({ key: "MainGameSceneAI" });
    this.room = room;
    this.userName = userName;
    this.socket = socket;
    this.gameOver = gameOver;
  }

  preload() {
    this.load.image("ball", "assets/ball.png");
    this.load.image("paddle", "assets/paddle.png");
    this.load.image("brick", "assets/brick.png");
  }

  create() {
    this.paddle = this.physics.add.sprite(400, 550, "paddle").setImmovable();
    // this.paddle.body.allowGravity = false;

    this.ball = this.physics.add
      .sprite(400, 500, "ball")
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setVelocity(150, -150);

    this.bricks = this.physics.add.staticGroup();
    const brickMap = new Map(); // Store brick positions
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 3; j++) {
        const x = 150 + i * (64 + 10);
        const y = 100 + j * (32 + 10);
        const brick = this.bricks.create(x, y, "brick");
        brick.setDisplaySize(64 * 1.2, 32);
        brick.setSize(64 * 1.2, 32);

        // Store brick reference with position key
        const brickId = `${x}-${y}`;
        brickMap.set(brick, brickId);
      }
    }

    this.physics.add.collider(this.ball, this.bricks, (ball, brick) => {
      if (!brickMap.has(brick)) return;

      // Get brick ID (x-y position)
      const brickId = brickMap.get(brick);

      // Send data about the destroyed brick
      this.socket.emit("brickDestroyed", {
        room: this.room,
        user: this.userName,
        brickId: brickId, // Send unique brick ID
      });

      brick.destroy();
      brickMap.delete(brick);
    });

    this.physics.add.collider(this.ball, this.paddle);

    // **Listen for paddle movement**
    // this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    //   this.paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
    //   this.socket.emit("movePaddle", {
    //     room: this.room,
    //     paddleX: this.paddle.x,
    //     user: this.userName,
    //   });
    // });
    // 🎯 **Limit Ball Update Frequency**
    this.ballUpdateInterval = setInterval(() => {
      if (this.ball && !this.gameOver) {
        this.socket.emit("updateBall", {
          room: this.room,
          x: this.ball.x,
          y: this.ball.y,
          user: this.userName,
        });
      }
    }, 200); // 🔽 Sends update every 200ms instead of every frame
  }
  update() {
    // if (this.gameOver) return; // Stop updating if the game is over
    this.socket.on("movePaddle", (data) => {
      this.paddle.x = data.paddleX;
      if (data.user !== this.userName) {
      }
    });
  
    // Check for game over (ball falls below the screen)
    if (this.ball.y > 600) {
      console.log("❌ Game Over!");
      this.gameOver = true;
      // **Stop Sending Updates**
      clearInterval(this.ballUpdateInterval); // ✅ Stops ball updates to reduce traffic

      this.socket.emit("gameOver", { room: this.room, user: this.userName });

      this.physics.pause(); // Stop game physics
      this.add
        .text(400, 300, "❌ GAME OVER ❌", {
          fontSize: "32px",
          color: "#ff0000",
        })
        .setOrigin(0.5);
    }
  }
}
