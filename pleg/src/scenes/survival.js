import { BaseScene } from "./base.js";

export default class SurvivalScene extends BaseScene {
  constructor() {
    super("SurvivalScene");
  }

  preload() {
    this.load.atlas(
      "enemies",
      "./assets/prod/atlas/enemies.png",
      "./assets/prod/atlas/enemies_atlas.json"
    );

    this.load.tilemapTiledJSON(
      "SurvivalMap",
      "./assets/prod/tilesets_and_maps/survival-new.json"
    );
    this.load.animation("female_anim", "./assets/prod/atlas/female_anim.json");
  }

  create() {
    super.create("SurvivalMap");

    this.physics.world.setBounds(0, 0, 1920, 1088);
    this.cameras.main.setBounds(0, 0, 1920, 1088);

    this.collide_with_world(); // Has to be called after the rest of the colliders are defined
  }
}
