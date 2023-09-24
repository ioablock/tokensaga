import { Math } from "phaser";
import { Actor } from "./actor";

export class Enemy extends Actor {
  activateEnemy;
  scene;
  AGRESSOR_RADIUS = 200;
  ATTACK_RANGE = 50;
  target;

  constructor(scene, x, y, texture, target, frame, hp, name) {
    super(scene, x, y, texture, frame, hp, name);
    this.target = target;
    this.scene = scene;

    // ADD TO SCENE
    scene.add.existing(this);
    scene.physics.add.existing(this);

    //Attack on collision
    scene.physics.add.collider(target, this);
    this.scene.game.events.on("playerAttack", this.playerAttacking, this);
  }

  playerAttacking = () => {
    if (this.dead() || this.target.dead()) {
      return;
    }

    if (Math.Distance.BetweenPoints(this, this.target) < this.ATTACK_RANGE) {
      this.damage();
    }
  };

  damage = () => {
    this.hp--;
    if (this.dead()) {
      this.onDeath();
    }
  };

  //Called when the enemy loses all health -> is dead
  onDeath = () => {
    this.disableBody(true, false);
    this.destroy();
  };

  attack = () => {
    if (this.target.dead() || this.dead()) {
      return;
    }
    this.target.hit();
  };

  update() {
    if (this.dead() || this.target.dead()) {
      if (this.attacktimer) {
        clearInterval(this.attacktimer);
        return;
      }
    }

    //If in the Attack range, the enemy will attack every aprox. 1 second
    //Player loses 2 HP /battle
    if (Math.Distance.BetweenPoints(this, this.target) < this.ATTACK_RANGE) {
      if (this.attacktimer == null) {
        this.attacktimer = setInterval(this.attack, 750);
      }
    }
    //If in the Aggression Radius, the enemy will move
    else if (
      Math.Distance.BetweenPoints(this, this.target) < this.AGRESSOR_RADIUS
    ) {
      this.getBody().setVelocityX(this.target.x - this.x);
      this.getBody().setVelocityY(this.target.y - this.y);
      //stopping the attack
      if (this.attacktimer) {
        clearInterval(this.attacktimer);
        this.attacktimer = null;
      }
    }
    //If not in the Aggression Radius, the enemy won't move
    else {
      this.getBody().setVelocity(0);
    }
  }
}
