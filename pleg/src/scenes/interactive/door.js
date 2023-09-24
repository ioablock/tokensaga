import Phaser from "phaser";

export class Door extends Phaser.GameObjects.Zone {
  constructor(scene, x, y, width, height, destination, link) {
    super(scene, x, y, width, height);

    // Tiled coordinate is of the bottom left of the object
    this.setOrigin(0, 1);

    // Add the GameObject and collider to the scene
    scene.add.existing(this);
    scene.physics.world.enable(this, 1); // 1 is for static body

    this.destination = destination;
    this.link = link;
    scene.physics.add.collider(scene.player, this, () => this.enterDoor(scene));
  }

  enterDoor(scene) {
    if (
      !scene.player.body.touching.none &&
      scene.player.body.wasTouching.none
    ) {
      if (this.link) {
        window.location.href = "./home#" + this.destination;
      } else {
        //Play Video Scene
        if (this.destination == "UniversityScene") {
          const customEvent = new CustomEvent("VIDEO");
          window.dispatchEvent(customEvent);
        }
        //Play Video Token Scene
        if (this.destination == "VideoTokenScene") {
          const customEvent = new CustomEvent("VIDEOTOKEN");
          window.dispatchEvent(customEvent);
        }
        //Staking Scene
        if (this.destination == "ResearchScene") {
          console.log("=====================door/STAKING");
          const customEvent = new CustomEvent("STAKING");
          window.dispatchEvent(customEvent);
        }
        //Create Token Scene
        if (this.destination == "TokenScene") {
          console.log("=====================door/TOKEN");
          const customEvent = new CustomEvent("TOKEN");
          window.dispatchEvent(customEvent);
        }
        if (
          this.destination == "SurvivalScene" ||
          this.destination == "OverworldScene"
        ) {
          scene.scene.switch(this.destination);
        }
      }
    }
  }
}
