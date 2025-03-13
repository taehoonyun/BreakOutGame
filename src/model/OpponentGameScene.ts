import Phaser from "phaser";
import { Socket } from "socket.io-client";
import { DeepSeekAPI } from "@/utils/index"; 

export class OpponentGameScene extends Phaser.Scene {
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.Physics.Arcade.StaticGroup;
  private room: string;
  private userName: string;
  private socket: Socket;
  private gameOver: boolean = false; // Track game state
  private deepSeekAPI: DeepSeekAPI;

  constructor(
    room: string,
    userName: string,
    socket: Socket,
    gameOver: boolean
  ) {
    super({ key: "OpponentGameScene" });
    this.room = room;
    this.userName = userName;
    this.socket = socket;
    this.gameOver = gameOver;
    this.deepSeekAPI = new DeepSeekAPI();
  }

  preload() {
    this.load.image("ball", "assets/ball.png");
    this.load.image("paddle", "assets/paddle.png");
    this.load.image("brick", "assets/brick.png");
  }

  create() {
    this.add
      .text(200, 50, "Opponent's Game", { fontSize: "16px", color: "#fff" })
      .setOrigin(0.5);

    this.paddle = this.physics.add.sprite(400, 550, "paddle").setImmovable();
    // this.paddle.body.allowGravity = false;

    this.ball = this.physics.add
      .sprite(400, 500, "ball")
      .setCollideWorldBounds(true)
      .setBounce(1);

    this.bricks = this.physics.add.staticGroup();
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 3; j++) {
        const brick = this.bricks.create(
          150 + i * (64 + 10),
          100 + j * (32 + 10),
          "brick"
        );
        brick.setDisplaySize(64 * 1.2, 32);
        brick.setSize(64 * 1.2, 32);
      }
    }

    // **Listen for paddle movement**
    this.socket.on("movePaddle", (data) => {
      if (data.user !== this.userName) {
        this.paddle.x = data.paddleX;
      }
    });

    // **Listen for ball movement**
    this.socket.on("updateBall", (data) => {
      if (data.user !== this.userName) {
        this.ball.setPosition(data.x, data.y);
      }
    });

    // **Listen for bricks being destroyed**
    this.socket.on("brickDestroyed", (data) => {
      if (data.user !== this.userName) {
        const brick = this.bricks.getChildren()[0];
        if (brick) (brick as Phaser.Physics.Arcade.Sprite).destroy();
      }
    });
  }
  update() {
    if (this.gameOver) return; // Stop updating if the game is over

    // Check for game over (ball falls below the screen)
    if (this.ball.y > 600) {
      console.log("❌ Game Over!");
      this.gameOver = true;
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
