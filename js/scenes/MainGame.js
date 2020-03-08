// create a new scene
let MainGame = new Phaser.Scene('Game');


MainGame.init = function (level_data) {
    console.log("Passed in level data: ", level_data);
    // Tracks how many levels we've gone through
    this.stageNum = level_data.stageNum;
    // Player's current coin count
    this.coins = level_data.coins;
    // Pick a random level, but do not pick the same level as the previous
    this.level_index = level_data.prev_index;
    while (this.level_index == level_data.prev_index)
        this.level_index = randInt(0, this.game.levelList.length);
    this.level = this.game.levelList[this.level_index];
    console.log("Loaded Level: ", this.level);
    // The upgrades which the user has earned
    this.upgrades = level_data.upgrades;
    // Tracks number of enemies slain this level
    this.slain = 0;
}

MainGame.create = function () {
    //create background image
    let bg = this.add.image(this.game.globals.centerX, this.game.globals.centerY, 'bg_' + this.level.key);
    bg.setScale(this.game.globals.scale_screen);
    //start playing background music
    this.backgroundMusic = this.sound.add("music_" + this.level.name);
    this.backgroundMusic.play();
    // Create the first monster
    this.createMonster();
    //add spinning coin
    this.coin = this.add.sprite(35, 50, "gold1").setScale(.1, .1)
    this.coin.play("coinSpin");
    //create the coin counter
    this.createCoinCounter();
    //splash text
    MainGame.introText();
    // Create shop menu (but only once!)
    if (this.stageNum == 1) {
        this.createUpgradeShop();
    }
    // Create an image in the game window to click to toggle menu
    let shopIcon = this.add.image(.92 * this.game.globals.width, .93 * this.game.globals.height, 'shop');
    shopIcon.setScale(this.game.globals.scale_ui);
    shopIcon.setInteractive();
    shopIcon.on("pointerdown", function () {
        this.toggleUpgradeShop();
    }, this);
    let that = this;
    // Execute the passive actions of any heroes!
    setInterval(function () {
        that.passiveActions();
    }, 1000);
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
    let original = this.game.monsters[monsterKey];
    // Make a true copy of the monster from the list for the battle
    this.currentMonster = jQuery.extend(true, {}, original);
    // Update the monster's health based on the stage number
    this.currentMonster.maxHealth = Math.ceil((original.health * this.stageNum) + ((this.stageNum - 1) * 10))
    this.currentMonster.health = this.currentMonster.maxHealth;
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
    //add sound to play when being attack
    this.currentMonster.hitSound = this.sound.add("punch");
    //set the actions to happen when the sprite is clicked on
    this.currentMonster.sprite.on("pointerdown", function () {
        this.currentMonsterHit();
        this.playHitTween();
    }, this)

    //create monster's health bar
    this.createHealthBar();
}

MainGame.createHealthBar = function () {
    //Health bar container, black line that surrounds the
    //health bar
    this.currentMonster.healthContainer = this.add.graphics();
    this.currentMonster.healthContainer.lineStyle(4, 0x000000, 1);
    this.currentMonster.healthContainer.strokeRoundedRect(250, 150, 150, 30, 15);
    this.currentMonster.healthContainer.depth = 2;
    //Colored health bar
    this.currentMonster.healthBar = this.add.graphics();
    this.currentMonster.healthBar.fillStyle(0x32a848, 1);
    this.currentMonster.healthBar.fillRoundedRect(250, 150, 150, 30, 15);
    this.currentMonster.healthBar.depth = 0;

    //Add health text
    this.currentMonster.healthText = this.add.text(330, 165, this.currentMonster.health + "/" +this.currentMonster.maxHealth,
        { font: "20px Arial", fill: "#000000" });
    this.currentMonster.healthText.setOrigin(.5, .5);
    this.currentMonster.healthText.depth = 1;
}

MainGame.createCoinCounter = function () {
    //create string object and style it
    this.coinText = this.add.text(75, 0, this.coins, {
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
        angle: { value: () => { return this.currentMonster.sprite.hitAngle; } },
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
        onActive: function () {
        },
        onComplete: MainGame.onMonsterDeath
    });
    //tween for dying END----------

}

MainGame.introText = function () {
    this.splashText = this.add.text(330, 125, "Welcome to " + this.level.name + "!",
        { font: "50px Arial", fill: "#5bf2fc" });
    this.splashText.setOrigin(.5, .5)
    this.splashText.setScale(0);
    this.splashText.splashIntroText = this.tweens.add({
        targets: this.splashText,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        yoyo: true,
        hold: 3000,
        repeat: 0,
    });
}



//                                        #    # #####  #####    ##   ##### ###### 
//                                        #    # #    # #    #  #  #    #   #      
//                                        #    # #    # #    # #    #   #   #####  
//                                        #    # #####  #    # ######   #   #      
//                                        #    # #      #    # #    #   #   #      
//                                         ####  #      #####  #    #   #   ###### 

MainGame.updateHealth = function () {
    //update health text
    this.currentMonster.healthText.setText(this.currentMonster.health + "/" +this.currentMonster.maxHealth);

    //health percentage
    let percentage = this.currentMonster.health / this.currentMonster.maxHealth;
    // Ensures health bar value does not go below 0
    if (10 - (Math.trunc(percentage * 10)) >= 0 && Math.trunc(percentage * 150) >= 0) {
        //clear graghics of old health bar
        this.currentMonster.healthBar.clear();

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
        //calculate fill color of the bar, make sure it never tries to go beyond the bounds of
        //the above color array
        if (10 - (Math.trunc(percentage * 10)) > 9){
            this.currentMonster.healthBar.fillStyle(colors[9], 1);
        } else {
            this.currentMonster.healthBar.fillStyle(colors[10 - (Math.trunc(percentage * 10))], 1);
        }
        //Make sure the angles don't overlap on the health bar
        if (percentage < .12){
            this.currentMonster.healthBar.fillRoundedRect(250, 155, Math.trunc(percentage * 150), 20,2);
        } else {
            this.currentMonster.healthBar.fillRoundedRect(250, 150, Math.trunc(percentage * 150), 30,15);
        }
        console.log(percentage,"< .10","\t",10 - (Math.trunc(percentage * 10)));
    } else {
        this.currentMonster.healthBar.clear();
    }
}

MainGame.updateCoinCounter = function () {
    this.coinText.setText(this.coins.toLocaleString());
}

MainGame.currentMonsterHit = function () {
    this.currentMonster.health -= (this.upgrades.hero.lvl) * 1;
    this.updateHealth();
    this.updateCoinCounter();
        this.currentMonster.hitSound.play();
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
    //set current monster to no longer be clickable
    this.currentMonster.sprite.disableInteractive();
    //play slap sound once
    this.sound.play("slap");
    //end idle animation/play death animation
    this.currentMonster.sprite.play(this.currentMonster.key + "_death")
    //plays an animation then destroy the old sprite and creates a new enenmy
    this.currentMonster.sprite.dieTween.play();
}

MainGame.onMonsterDeath = function () {
    // Destory the sprite
    this.currentMonster.sprite.destroy();
    //destroy the health bar, health bar container and health text
    this.currentMonster.healthContainer.destroy();
    this.currentMonster.healthBar.destroy();
    this.currentMonster.healthText.destroy();
    // Increment the number of monsters slain
    this.slain++;
    // Earn some coins based on the stage # and the monster's health
    this.coins += Math.ceil(this.stageNum * (.2 * this.currentMonster.maxHealth));
    this.updateCoinCounter();
    // Check if the final monster has been killed
    if (this.slain >= 10) {
        this.backgroundMusic.stop();
        // Change levels
        this.scene.start('Game', {
            stageNum: this.stageNum + 1,
            coins: this.coins,
            prev_index: this.level_index,
            upgrades: this.upgrades
        });
    } else {
        // Create the next monster
        this.createMonster();
    }
}

MainGame.passiveActions = function () {
    // Deal the wizard's damage
    this.currentMonster.health -= (this.upgrades.wizard.lvl) * 1;
    this.updateHealth();
    if (this.currentMonster.health <= 0 && !this.currentMonster.sprite.dieTween.isPlaying()) {
        this.killMonster();
        return;
    }
}
