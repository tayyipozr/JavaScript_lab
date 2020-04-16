var config = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, window.outerWidth),
    height: Math.min(window.innerHeight, window.outerHeight),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    debug: true
};

var game = new Phaser.Game(config);

var backgroundLayer;
var collisionLayer;
var itemsLayer;

var map;
var coinsCollected = 0;
var bestCollected = 0;
var text;
var player;
var items;
var bombs;
var gameOver = false;
var move_ctl = false;
var left, right, up, down;
var lastCollisonTime;
var time = 7;
var bombs;
var onResume = true;

var isCollisionItem;

function preload() {
    this.load.spritesheet('robot', 'assets/lego.png', { frameWidth: 37, frameHeight: 48 });
    this.load.spritesheet('bomb', 'assets/bomb.png', { frameWidth: 37, frameHeight: 48 })
    this.load.spritesheet('items', 'assets/items.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('tiles', 'assets/map_tiles.png');
    this.load.tilemapTiledJSON('json_map', 'assets/json_map.json');

    this.load.audio('coins_music', 'assets/sounds/p-ping.mp3');
    this.load.audio('background_music', 'assets/sounds/bodenstaendig_2000_in_rock_4bit.mp3');
    this.load.audio('wall_hit', 'assets/sounds/blaster.mp3');
    this.load.audio('player_explosion', 'assets/sounds/explosion.mp3');

}

function resize(width, height) {
    if (width === undefined) { width = game.config.width; }
    if (height === undefined) { height = game.config.height; }
    //console.log('W: ' +  width + ', H: ' + height); 
    /*if (width < backgroundLayer.width || height < backgroundLayer.height) {
        map.scene.cameras.main.zoom = 0.5;
        map.scene.cameras.main.setPosition(-width / 2, -height / 2);
    } else {
        map.scene.cameras.main.zoom = 1;
        map.scene.cameras.main.setPosition(0, 0);
    }
    //backgroundLayer.setSize(width, height);
    map.scene.cameras.resize(width / map.scene.cameras.main.zoom, height / map.scene.cameras.main.zoom);
    if (game.renderer.type === Phaser.WEBGL) {
        game.renderer.resize(width, height);
    }
    updateText();
    */
}

function create() {
    isCollisionItem = false;
    map = this.make.tilemap({ key: 'json_map' });
    //F: 'map_tiles' - name of the tilesets in json_map.json
    //F: 'tiles' - name of the image in load.images()
    var tiles = map.addTilesetImage('map_tiles', 'tiles');

    backgroundLayer = map.createDynamicLayer('background', tiles, 0, 0);
    collisionLayer = map.createDynamicLayer('collision', tiles, 0, 0); //.setVisible(false);
    collisionLayer.setCollisionByExclusion([-1]);
    map.scene.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#007A00");


    background_sound = this.sound.add('background_music', { 'volume': 1 });
    background_sound.stop();
    background_sound.play();
    coins_sound = this.sound.add('coins_music');
    wall_sound = this.sound.add('wall_hit', { 'volume': 0.5 })
    player_explosion = this.sound.add('player_explosion')


    items = this.physics.add.sprite(100, 150, 'items');
    items.setBounce(0.1);

    player = this.physics.add.sprite(100, 450, 'robot');
    player.setBounce(0.1);

    bombs = this.physics.add.group({
        bounceX: 1,
        bounceY: 1,
        collideWorldBounds: true,
    });

    bombs.create(40, 40, 'bomb').setVelocity(300, 200);

    function createBomb() {
        random = Math.ceil(Math.random() * 20)
        console.log(bombs.getLength());
        if (bombs.getLength() < 5) {
            bombs.create(50 + random, 50 + random, 'bomb').setVelocity(300, 200);
        }
    }

    setInterval(createBomb, 30000)

    this.physics.add.collider(player, collisionLayer);
    this.physics.add.overlap(player, backgroundLayer);
    this.physics.add.collider(bombs, collisionLayer, collisionHandlerWall);
    this.physics.add.collider(bombs, bombs);

    //F:set collision range 
    backgroundLayer.setCollisionBetween(1, 25);

    //F:Checks to see if the player overlaps with any of the items, 
    //f:if he does call the collisionHandler function
    this.physics.add.overlap(player, items, collisionHandler);
    this.physics.add.overlap(player, bombs, collisionHandlerBomb);

    function lastCollisonTimeHandler() {
        var d2 = new Date();
        var now = d2.getSeconds();
        if (time >= 1) {
            time--;
            updateText();
            if (time == 0) {
                time = 7;
            }
        }
        if (now >= lastCollisonTime + 7) {
            console.log(`now: ${now}, lastcollison: ${lastCollisonTime}`)
            if (coinsCollected != 0) {
                coinsCollected--;
            }
            updateText();
            lastCollisonTime = lastCollisonTime += 7;
        }
    }
    setInterval(lastCollisonTimeHandler, 1000);


    this.cameras.main.startFollow(player);

    text = this.add.text(game.canvas.width / 3, 16, '', {
        fontSize: '3em',
        fontFamily: 'fantasy',
        align: 'center',
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: '#ffffff'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    text2 = this.add.text(game.canvas.width / 3, 16, '', {
        fontSize: '3em',
        fontFamily: 'fantasy',
        align: 'center',
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: '#ffffff'
    });
    text2.setOrigin(0.5);
    text2.setScrollFactor(0);

    text3 = this.add.text(game.canvas.width / 3, 16, '', {
        fontSize: '3em',
        fontFamily: 'fantasy',
        align: 'center',
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: '#ffffff'
    });
    text3.setOrigin(0.5);
    text3.setScrollFactor(0);

    text4 = this.add.text(game.canvas.width / 3, 16, '', {
        fontSize: '3em',
        fontFamily: 'fantasy',
        align: 'center',
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: '#ffffff'
    });
    text4.setOrigin(0.5);
    text4.setScrollFactor(0);

    updateText();

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 16 }),
        frameRate: 20,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerdown', function(pointer) {
        move_ctl = true;
        pointer_move(pointer);
    });
    this.input.on('pointerup', function(pointer) {
        move_ctl = false;
        reset_move()
    });
    this.input.on('pointermove', pointer_move);
    window.addEventListener('resize', function(event) {
        resize(Math.min(window.innerWidth, window.outerWidth), Math.min(window.innerHeight, window.outerHeight));
    }, false);
    resize(Math.min(window.innerWidth, window.outerWidth), Math.min(window.innerHeight, window.outerHeight));
}


function pointer_move(pointer) {
    var dx = dy = 0;
    //var min_pointer=20; // virtual joystick
    var min_pointer = (player.body.width + player.body.height) / 4; // following pointer by player
    if (move_ctl) {
        reset_move();
        /*			// virtual joystick
         			dx =  (pointer.x - pointer.downX); 
        			dy = (pointer.y - pointer.downY);*/

        // following pointer by player
        dx = (pointer.x / map.scene.cameras.main.zoom - player.x);
        dy = (pointer.y / map.scene.cameras.main.zoom - player.y);
        //console.log( 'Xp:'  + player.x + ', Xc:'  + pointer.x + ', Yp:' + player.y + ', Yc:' + pointer.y );

        if (Math.abs(dx) > min_pointer) {
            left = (dx < 0);
            right = !left;
        } else {
            left = right = false;
        }
        if (Math.abs(dy) > min_pointer) {
            up = (dy < 0);
            down = !up;
        } else {
            up = down = false;
        }
    }
    //console.log( 'L:'  + left + ', R:'  + right + ', U:' + up + ', D:' + down, ', dx: ' + dx + ',dy: ' + dy );
}

function reset_move() {
    up = down = left = right = false;
}

function update() {
    if (onResume) {
        // Needed for player following the pointer:
        if (move_ctl) { pointer_move(game.input.activePointer); }

        // Horizontal movement
        if (cursors.left.isDown || left) {
            player.body.setVelocityX(-150);
            player.angle = 90;
            player.anims.play('run', true);
        } else if (cursors.right.isDown || right) {
            player.body.setVelocityX(150);
            player.angle = 270;
            player.anims.play('run', true);
        } else {
            player.body.setVelocityX(0);
        }

        // Vertical movement
        if (cursors.up.isDown || up) {
            player.body.setVelocityY(-150);
            player.angle = 180;
            player.anims.play('run', true);
        } else if (cursors.down.isDown || down) {
            player.body.setVelocityY(150);
            player.anims.play('run', true);
            player.angle = 0;
        } else {
            player.body.setVelocityY(0);
        }
    }
}

function updateText() {
    text.setPosition(game.canvas.width / 4 / map.scene.cameras.main.zoom, text.height);
    text.setText(
        'Coins collected: ' + coinsCollected //+ '    Best result: ' + bestCollected
    );
    text.setColor('white');

    text2.setPosition(game.canvas.width / 4 * 3 / map.scene.cameras.main.zoom, text.height);
    text2.setText(
        'Best Score: ' + bestCollected //+ '    Best result: ' + bestCollected
    );
    text2.setColor('white');

    text3.setPosition(game.canvas.width / 4 * 2 / map.scene.cameras.main.zoom, text.height);
    text3.setText(
        `Time: ${time}`
    );
    text3.setColor('white');
}

function collisionHandlerBomb(player, bomb) {
    coinsCollected = 0;
    player_explosion.play();
    text4.setVisible(true);
    text4.setPosition(game.canvas.width / 2, game.canvas.height / 2);
    text4.setText(
        `Crashed`
    );
    text4.setColor('white');
    setTimeout(hideHandler, 2000);

    function hideHandler() {
        text4.setVisible(false);
    }
}

function collisionHandlerWall() {
    wall_sound.play();
}

// If the player collides with items
function collisionHandler(player, item) {
    coins_sound.play();
    isCollisionItem = true;
    time = 7;
    var d = new Date();
    lastCollisonTime = d.getSeconds();
    coinsCollected += 1;

    if (coinsCollected > bestCollected) {
        bestCollected = coinsCollected;
    }

    updateText();
    //items.destroy();
    item.disableBody(true, true);

    if (item.body.enable == false) {
        var h = map.heightInPixels - 40;
        var w = map.widthInPixels - 40;
        var itemX = Phaser.Math.Between(40, w);
        var itemY = Phaser.Math.Between(40, h);
        var itemID = Phaser.Math.Between(0, 118);
        item.setFrame(itemID);
        item.enableBody(true, itemX, itemY, true, true);
    }

}