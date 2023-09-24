import Phaser from "phaser";
import Player from "./Player.js";
import Resource from "./Resource.js";
import Enemy from "./Enemy.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.enemies = [];
  }

  preload() {
    Player.preload(this);
    Enemy.preload(this);
    Resource.preload(this);
    this.load.image("tiles", "assets/images/RPG Nature Tileset.png");
    this.load.tilemapTiledJSON("map", "assets/images/map.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    this.map = map;
    const tileset = map.addTilesetImage(
      "RPG Nature Tileset",
      "tiles",
      32,
      32,
      0,
      0
    );

    const layer1 = map.createLayer("Tile Layer 1", tileset, 0, 0);

    layer1.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(layer1);
    this.matter.world.setBounds(map.widthInPixels, map.heightInPixels);

    this.map
      .getObjectLayer("Resources")
      .objects.forEach((resource) => new Resource({ scene: this, resource }));

    this.map
      .getObjectLayer("Enemies")
      .objects.forEach((enemy) =>
        this.enemies.push(new Enemy({ scene: this, enemy }))
      );
    this.player = new Player({
      scene: this,
      x: 150,
      y: 220,
      texture: "female",
      frame: "townsfolk_f_idle_1",
    });

    //We want the camera to follow the player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.player.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.enemies.forEach((enemy) => enemy.update());
    this.player.update();
  }
}
