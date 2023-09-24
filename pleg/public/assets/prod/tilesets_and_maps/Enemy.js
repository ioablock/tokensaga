import MatterEntity from "./MatterEntity.js";
import Phaser from "phaser";

export default class Enemy extends MatterEntity {

  static preload(scene){
    scene.load.atlas('enemies','assets/images/enemies.png','assets/images/enemies_atlas.json');
    scene.load.animation('enemies_anim','assets/images/enemies_anim.json');
    scene.load.audio('bear','assets/audio/bear.mp3');
    scene.load.audio('wolf','assets/audio/wolf.mp3');
    scene.load.audio('troll','assets/audio/troll.mp3');
  }
  constructor(data){
    let {scene,enemy} = data;
    let drops = JSON.parse(enemy.properties.find(p=>p.name=='drops').value);
    //Attributes of nft
    let health = enemy.properties.find(p=>p.name=='health').value;
    super({scene,x:enemy.x,y:enemy.y,texture:'enemies',frame:`${enemy.name}_idle_1`,drops,health,name:enemy.name});
 
    const {Body,Bodies} = Phaser.Physics.Matter.Matter;
    var enemyCollider = Bodies.circle(this.x,this.y,12,{isSensor:false,label:'enemyCollider'});
    //80 -> the enemy senses at a larger distance
    var enemySensor = Bodies.circle(this.x,this.y,80, {isSensor:true, label:'enemySensor'});
    const compoundBody = Body.create({
      parts:[enemyCollider,enemySensor],
      frictionAir: 0.35,
    });
    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.scene.matterCollision.addOnCollideStart({
        objectA:[enemySensor],
        callback: other => {if(other.gameObjectB && other.gameObjectB.name == 'player') this.attacking = other.gameObjectB;},
        context:this.scene,
      });
}

attack = (target) => {
    if(target.dead || this.dead) {
      clearInterval(this.attacktimer);
      return;
    }
    target.hit();
  }

  update(){
    
    if(this.dead) return;
    if(this.attacking){
        //The enemy walks towards the player
      let direction = this.attacking.position.subtract(this.position);
      //If close to the player, than attack at regular interval
      if(direction.length()>24) {
        let v = direction.normalize();
        this.setVelocityX(direction.x);
        this.setVelocityY(direction.y);
        if(this.attacktimer) {
          clearInterval(this.attacktimer);
          this.attacktimer = null;
        }
      } else {
        if(this.attacktimer == null) {
          this.attacktimer = setInterval(this.attack,500,this.attacking);
        }
      }
    }
    //The enemy will flip on the X axis to follow the player
    this.setFlipX(this.velocity.x < 0);
    //The animation of the enemies
    if(Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
      this.anims.play(`${this.name}_walk`,true);
    }else {
      this.anims.play(`${this.name}_idle`,true);
    }
  }
}