import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const DinoGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 1000 },
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
    let dino: Phaser.Physics.Arcade.Sprite;
    let obstacles: Phaser.Physics.Arcade.Group;
    let isGameOver = false;
    let score = 0;
    let scoreText: Phaser.GameObjects.Text;

    function preload(this: Phaser.Scene) {
      this.load.image(
        "ground",
        "https://labs.phaser.io/assets/sprites/platform.png"
      );
      this.load.image("dino", "https://labs.phaser.io/assets/sprites/dino.png");
      this.load.image(
        "cactus",
        "https://labs.phaser.io/assets/sprites/cactus.png"
      );
    }

    function create(this: Phaser.Scene) {
      // 땅 생성
      const ground = this.physics.add
        .staticSprite(400, 380, "ground")
        .setScale(2, 0.5)
        .refreshBody();
 
      // 공룡 생성
      dino = this.physics.add.sprite(100, 300, "dino").setScale(0.5);
      dino.setCollideWorldBounds(true);

      // 장애물 그룹 생성
      obstacles = this.physics.add.group();

      // 점수 표시
      scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "24px",
        color: "#fff",
      });

      // 장애물 생성 타이머
      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
            if (!isGameOver) {
                const cactus = obstacles.create(800, 320, "cactus"); // 🔥 Y값 수정
                cactus.setScale(0.8);
                cactus.setVelocityX(-200 - score * 2);
                cactus.setImmovable(false);
                // cactus.body.allowGravity = false; // 중력 영향 제거
              }
        },
      });

      // 공룡과 땅 충돌
      this.physics.add.collider(dino, ground);
      this.physics.add.collider(obstacles, ground);

      // 공룡과 장애물 충돌 감지
      this.physics.add.collider(dino, obstacles, () => {
        isGameOver = true;
        this.physics.pause();
        this.add
          .text(400, 200, "❌ GAME OVER ❌", {
            fontSize: "32px",
            color: "#ff0000",
          })
          .setOrigin(0.5);
      });

      // 스페이스바 입력 감지
      this.events.once("create", () => {
        if (this.input.keyboard) {
          this.input.keyboard.on("keydown-SPACE", () => {
            if (dino.body?.touching.down) {
              dino.setVelocityY(-500);
            }
          });
        }
      });

      // 점수 증가 타이머
      this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          if (!isGameOver) {
            score += 1;
            scoreText.setText("Score: " + score);
          }
        },
      });
    }

    function update(this: Phaser.Scene) {
      // 장애물이 화면을 벗어나면 삭제
      obstacles
        .getChildren()
        .forEach((cactus: Phaser.GameObjects.GameObject) => {
          if ((cactus as Phaser.Physics.Arcade.Sprite).x < -50) {
            (cactus as Phaser.Physics.Arcade.Sprite).destroy();
          }
        });
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef}></div>;
};

export default DinoGame;
