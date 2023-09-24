import { Physics } from "phaser";

export class Actor extends Physics.Arcade.Sprite {
  hp;
  name;

  constructor(scene, x, y, texture, frame, hp, name) {
    super(scene, x, y, texture, frame);

    this.hp = hp;
    this.name = name;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.getBody().setCollideWorldBounds(true);
  }

  dead() {
    return this.hp <= 0;
  }

  onDeath = () => {};

  hit = () => {
    this.hp--;
    if (this.dead()) {
      this.onDeath();
    }
  };

  getHP() {
    return this.hp;
  }

  getName() {
    return this.name;
  }

  checkFlip() {
    if (this.body.velocity.x < 0) {
      this.scaleX = -1;
    } else {
      this.scaleX = 1;
    }
  }

  getBody() {
    return this.body;
  }
}
