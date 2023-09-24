import { Actor } from "./actor";

export class Player extends Actor {
  scene;
  flipped;
  hasWeapon;

  constructor(scene, x, y, texture, frame, hasWeapon, hp, name) {
    super(scene, x, y, texture, frame, hp, name);

    this.hasWeapon = hasWeapon;

    this.scene = scene;
    this.flipped = false;

    // Add the sprite and the physics body to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set the depth and the size
    this.setDepth(5);
    this.body.setSize(26, 41);

    if (hasWeapon) {
      this.attackKey = this.scene.input.keyboard.addKey(32);

      this.attackKey.on("down", (event) => {
        this.scene.game.events.emit("playerAttack");
        this.anims.play("attack", true);
      });

      this.attackKey.on("up", (event) => {
        this.anims.play("idle", true);
      });
    }

    // Speed of movement
    this.speed = 175;
  }

  //Called when the player loses all health -> is dead
  onDeath = () => {
    this.anims.stop();
    //On the items.png, the 0 is a death symbol
    this.setTexture("items", 0);
    this.setOrigin(0.5);
  };

  checkFlip() {
    if (this.body.velocity.x < 0) {
      this.scaleX = -1;
    } else {
      this.scaleX = 1;
    }
  }

  update(moveleft, moveright, moveup, movedown) {
    if (this.dead()) return;

    const prevVelocity = this.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.body.setVelocity(0);

    // Update the animation and give left/right animations precedence over up/down animations in diagonal movement
    if (moveleft) {
      this.body.setVelocityX(-this.speed);
      this.checkFlip();
      this.anims.play("run", true);
    } else if (moveright) {
      this.body.setVelocityX(this.speed);
      this.checkFlip();
      this.anims.play("run", true);
    }
    if (moveup) {
      this.body.setVelocityY(-this.speed);
      if (!(moveleft || moveright)) {
        // When moving diagonally display the left / right animation
        this.anims.play("run", true);
      }
    } else if (movedown) {
      this.body.setVelocityY(this.speed);
      if (!(moveleft || moveright)) {
        // When moving diagonally display the left / right animation
        this.anims.play("run", true);
      }
    }

    // Normalize and scale the velocity so that player doesn't move faster along a diagonal
    this.body.velocity.normalize().scale(this.speed);

    // If not moving (and not waving or at the start of the game), stop animations and pick and idle frame
    if (
      !(moveleft || moveright || moveup || movedown) &&
      // This next part is so that it doesn't stop the waving animation in the overworld
      // Second disjunct is if it was already playing it (from prev iteration of Overworld's update)
      // First disjunct is bc at the start of the game currentAnim is null, comparing with .key gives an error
      !(this.anims.currentAnim == null)
    ) {
      if (this.anims.currentAnim.key != "attack") {
        this.anims.play("idle", true);
      }
    }
  }
}
