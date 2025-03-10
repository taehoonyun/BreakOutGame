import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const BreakDownGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
      parent: gameRef.current,
    };

    const game = new Phaser.Game(config);

    function preload(this: Phaser.Scene) {
      this.load.image("ball", "assets/ball.png");
      this.load.image("paddle", "assets/paddle.png");
      this.load.image("brick", "assets/brick.png");
    }

    function create(this: Phaser.Scene) {
      let ballLost = false;
      let bricksLeft = 15; // 총 벽돌 개수

      const paddle = this.physics.add.sprite(400, 550, "paddle").setImmovable();
      paddle.body.allowGravity = false;

      const ball = this.physics.add.sprite(400, 500, "ball").setCollideWorldBounds(true).setBounce(1);
      ball.setVelocity(150, -150);

      // 🧱 벽돌 생성 (가로 크기 1.2배 증가)
      const brickWidth = 64 * 1.2; // 64 → 77
      const brickHeight = 32; // 높이는 그대로 유지
      const bricks = this.physics.add.staticGroup();
      
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 3; j++) {
          const brick = bricks.create(150 + i * (brickWidth + 10), 100 + j * (brickHeight + 10), "brick");
          brick.setDisplaySize(brickWidth, brickHeight); // 크기 조정
          brick.setSize(brickWidth, brickHeight); // 충돌 박스 조정
        }
      }

      // 🏀 공과 벽돌 충돌 감지
      this.physics.add.collider(ball, bricks, (ball, brick) => {
        brick.destroy();
        bricksLeft--;
        if (bricksLeft === 0) {
          gameClear(this);
        }
      });

      // 🏓 공과 패들 충돌 감지
      this.physics.add.collider(ball, paddle);

      // 🏆 게임 클리어 함수
      function gameClear(scene: Phaser.Scene) {
        scene.physics.pause();
        scene.add
          .text(400, 300, "🎉 GAME CLEAR 🎉", {
            fontSize: "32px",
            color: "#00ff00",
          })
          .setOrigin(0.5);
      }

      // ❌ 게임 오버 감지
      this.physics.world.on("worldbounds", (body: any) => {
        if (body.gameObject === ball && !ballLost) {
          ballLost = true;
          gameOver(this);
        }
      });

      // ❌ 게임 오버 함수
      function gameOver(scene: Phaser.Scene) {
        scene.physics.pause();
        scene.add
          .text(400, 300, "❌ GAME OVER ❌", {
            fontSize: "32px",
            color: "#ff0000",
          })
          .setOrigin(0.5);
      }

      // 🎮 패들 이동 조정
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
      });
    }

    function update(this: Phaser.Scene) {}

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef}></div>;
};

export default BreakDownGame;
