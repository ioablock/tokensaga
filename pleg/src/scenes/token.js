import { BaseScene } from "./base.js";

export default class TokenScene extends BaseScene {
  constructor() {
    super("TokenScene");
  }

  preload() {}

  create() {
    super.create("TokenMap");

    // Resize the world and camera bounds
    this.physics.world.setBounds(0, 0, 960, 768);
    this.cameras.main.setBounds(0, 0, 960, 768);

    this.collide_with_world(); // Has to be called after the rest of the colliders are defined
  }
}
