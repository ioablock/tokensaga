import { BaseScene } from "./base.js";
import "./interactive/factory.js"; // This has to run before the first scene in order to add the commands

export default class OverworldScene extends BaseScene {
  constructor() {
    super("OverworldScene");
  }

  preload() {
    // The keys have to be unique! Otherwise they will not be preloaded again.
    this.load.image(
      "TilesetImage",
      "./assets/prod/tilesets_and_maps/tileset_extruded.png"
    );
    this.load.tilemapTiledJSON(
      "OverworldMap",
      "./assets/prod/tilesets_and_maps/overworld-new.json"
    );

    this.load.image(
      "TilesetImage2",
      "./assets/prod/tilesets_and_maps/RPG Nature Tileset.png"
    );
    this.load.image(
      "TilesetPortal",
      "./assets/prod/tilesets_and_maps/TX Struct.png"
    );
    this.load.image("TilesetSG", "./assets/prod/tilesets_and_maps/TXGrass.png");
    this.load.image("TilesetP", "./assets/prod/tilesets_and_maps/TX Plant.png");

    this.load.atlas(
      "female",
      "./assets/prod/atlas/female.png",
      "./assets/prod/atlas/female_atlas.json"
    );
    this.load.bitmapFont(
      "pixelop",
      "assets/prod/fonts/pixelop.png",
      "assets/prod/fonts/pixelop.xml"
    );
    this.load.atlas(
      "anims_ui",
      "./assets/prod/atlas/anims_ui.png",
      "./assets/prod/atlas/anims_ui.json"
    );

    this.load.animation("female_anim", "./assets/prod/atlas/female_anim.json");
    //this.load.image("logotwitter", "assets/images/twitter.png");

    this.load.spritesheet("items", "./assets/images/items.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    super.create("OverworldMap");

    // Resize the world and camera bounds
    this.physics.world.setBounds(0, 0, 1920, 1088);
    this.cameras.main.setBounds(0, 0, 1920, 1088);

    this.collide_with_world(); // Has to be called after the rest of the colliders are defined

    //var button = this.add.image(120, 45, "logotwitter").setInteractive();
    // button.setScrollFactor(0).setDepth(105);

    // button.on("pointerup", this.openExternalLink, this);
  }

  /*openExternalLink = () => {
    var url = "https://twitter.com/TokenSaga";

    var s = window.open(url, "_blank");

    if (s && s.focus) {
      s.focus();
    } else if (!s) {
      window.location.href = url;
    }
  };*/
}
