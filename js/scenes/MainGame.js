// create a new scene
let MainGame = new Phaser.Scene('Game');

MainGame.init = function () {
    this.coins = 0;     //used to keep track of how many coins we've collected
    // Pick a random level
    this.level = this.game.levelList[randInt(0, this.game.levelList.length)];
    console.log("Loaded Level: ", this.level);
}

MainGame.preload = function () {
}

MainGame.create = function () {
    // Create shop menu
    this.createUpgradeShop();
    this.toggleUpgradeShop();
    //create background image
    let bg = this.add.image(this.game.globals.centerX, this.game.globals.centerY, 'bg_' + this.level.key);
    bg.setScale(this.game.globals.scale_screen);
    // Create the first monster
    this.createMonster();
    //add spinning coin
    this.coin = this.add.sprite(35, 50, "gold1").setScale(.1, .1)
    this.coin.play("coinSpin");
    //create the coin counter
    this.createCoinCounter();
}

//----------------------------------------Additional Functions----------------------------------------

//                                 #####                                    
//                                #     # #####  ######   ##   ##### ###### 
//                                #       #    # #       #  #    #   #      
//                                #       #    # #####  #    #   #   #####  
//                                #       #####  #      ######   #   #      
//                                #     # #   #  #      #    #   #   #      
//                                 #####  #    # ###### #    #   #   ###### 


MainGame.createMonster = function () {
    // Pick a random moster from our list (not the last one b/c its the boss)
    let monsterKey = this.level.monsters[randInt(0, this.level.monsters.length - 1)];
    this.currentOriginal = this.game.monsters[monsterKey];

    // Make a true copy of the monster from the list for the battle
    this.currentMonster = jQuery.extend(true, {}, this.currentOriginal);
    console.log("Current Monster: ", this.currentMonster);

    //add the sprite to the gamescreen
    this.currentMonster.sprite = this.add.sprite(this.game.globals.centerX, this.game.globals.centerY, this.currentMonster.key, 0);
    // set the sprite's origin to its center
    this.currentMonster.sprite.setOrigin(.5, .5);
    //set sprite scale
    this.currentMonster.sprite.setScale(this.game.globals.scale_monster);
    //set sprite to be interactive
    this.currentMonster.sprite.setInteractive();
    //set tween for getting hit
    this.addTweens();
    //start idle animation
    this.currentMonster.sprite.play(this.currentMonster.key + "_idle");
    //set the actions to happen when the sprite is clicked on
    this.currentMonster.sprite.on("pointerdown", function () {
        this.currentMonsterHit();
        this.playHitTween();
    }, this)

    //create monster's health bar
    this.createHealthBar();
}

MainGame.createHealthBar = function () {
    //create health bar
    this.currentMonster.healthBar = this.add.graphics();
    this.currentMonster.healthBar.fillStyle(0x32a848, 1);
    this.currentMonster.healthBar.fillRect(250, 130, 150, 30);
}

MainGame.createCoinCounter = function () {
    //create string object and style it
    this.coinText = this.add.text(75, 0, "0", {
        font: "100px Ariel",
        fill: '#ffed70'
    });
    this.coinText.align = "right";
    this.coinText.fontWeight = 'bold';
    //for gold outline "#FFDF00"
    this.coinText.setStroke("#a69a47", 8);
}

MainGame.addTweens = function () {
    //tween for taking damage----------
    this.currentMonster.sprite.hitAngle = -45;
    this.currentMonster.sprite.hitTween = this.tweens.add({
        targets: this.currentMonster.sprite,

        scaleY: this.currentMonster.sprite.scaleY * 1.5,
        angle: {value: () => { return this.currentMonster.sprite.hitAngle; }},
        duration: 80,
        paused: true,
        yoyo: true,
        ease: 'Quad.easeInOut',
        callbackScope: this,
        onUpdate: function (tween) {
            if (tween.elapsed < (tween.duration / 2) && Math.trunc(tween.elapsed / ((tween.duration / 2)) * 255) < 255) {
                this.currentMonster.sprite.setTint(Phaser.Display.Color.GetColor(155 + Math.trunc(tween.elapsed / ((tween.duration / 2)) * 100), 0, 0));
            } else if ((540 - Math.trunc(tween.elapsed / ((tween.duration / 2)) * 255)) > 0 && (540 - Math.trunc(tween.elapsed / ((tween.duration / 2)) * 255)) < 255) {
                this.currentMonster.sprite.setTint(Phaser.Display.Color.GetColor((320 - Math.trunc(tween.elapsed / ((tween.duration / 2)) * 100)), 0, 0));
            }
        },
        onComplete: function (tween) {
            this.currentMonster.sprite.clearTint();
        }
    });

    //tween for taking damage END----------

    //tween for dying
    this.currentMonster.sprite.dieTween = this.tweens.add({
        delay: 500,
        targets: this.currentMonster.sprite,
        scaleY: 0,
        scaleX: 0,
        angle: 1440,
        duration: 1100,
        paused: true,
        yoyo: false,
        ease: 'Quad.easeInOut',
        callbackScope: this,
        onActive: function(){
        },
        onComplete: function (tween) {
            this.currentMonster.sprite.destroy();
            this.createMonster();
        }
    });
    //tween for dying END----------

}



//                                        #    # #####  #####    ##   ##### ###### 
//                                        #    # #    # #    #  #  #    #   #      
//                                        #    # #    # #    # #    #   #   #####  
//                                        #    # #####  #    # ######   #   #      
//                                        #    # #      #    # #    #   #   #      
//                                         ####  #      #####  #    #   #   ###### 

MainGame.updateHealthBar = function () {
    //health bar color codes
    colors = [
        0x42f598,
        0x42f578,
        0x42f54b,
        0x69f542,
        0xb8a425,
        0xb88c25,
        0xb87625,
        0xb86a25,
        0xb85625,
        0xb84225,
    ]
    //health percentage
    let percentage = this.currentMonster.health / this.currentOriginal.health;
    //clear graghics of old health bar
    this.currentMonster.healthBar.clear();
    //redraw and change bar size/color
    this.currentMonster.healthBar.fillStyle(colors[10 - (Math.trunc(percentage * 10))], 1);
    this.currentMonster.healthBar.fillRect(250, 130, Math.trunc(percentage * 150), 30);
}

MainGame.updateCoinCounter = function () {
    this.coinText.setText(this.coins.toLocaleString());
}

MainGame.currentMonsterHit = function () {
    this.coins += 100;
    this.currentMonster.health -= 5;
    this.updateHealthBar();
    this.updateCoinCounter();
    if (this.currentMonster.health <= 0) {
        this.killMonster();
        return;
    }
}

MainGame.playHitTween = function () {
    let angle = Math.trunc(Math.random() * 45)
    angle = Math.random() < .5 ? angle : angle * -1;
    this.currentMonster.sprite.hitAngle = angle;
    if (this.currentMonster.sprite.hitTween.isPlaying()) {
        this.currentMonster.sprite.hitTween.stop(0);
    } else {
        this.currentMonster.sprite.hitTween.play();
    }
}


//                                       ######                                          
//                                       #     # ######  ####  ##### #####   ####  #   # 
//                                       #     # #      #        #   #    # #    #  # #  
//                                       #     # #####   ####    #   #    # #    #   #   
//                                       #     # #           #   #   #####  #    #   #   
//                                       #     # #      #    #   #   #   #  #    #   #   
//                                       ######  ######  ####    #   #    #  ####    #   


MainGame.killMonster = function () {
    //end idle animation/play death animation
    this.currentMonster.sprite.play(this.currentMonster.key + "_death")
    //plays an animation then destroy the old sprite and creates a new enenmy
    this.currentMonster.sprite.dieTween.play();
}

