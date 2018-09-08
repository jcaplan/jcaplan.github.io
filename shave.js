const width = 800;
const height = 600;
const default_x = 6;
const default_y = 9

var game = new Phaser.Game(width, height, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });
var shave_names = [];
var shaves = [];

WebFontConfig = {
    google: {
      families: ['Fontdiner Swanky']
    }
};

function preload() {
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    game.load.image('start', 'assets/start.png');
    game.load.image('background', 'assets/background.jpg');
    game.load.image('chair', 'assets/chair.png');
    game.load.image('body', 'assets/body.png');
    game.load.image('beard', 'assets/beard.png');
    game.load.image('beard_left', 'assets/beard_left.png');
    game.load.image('beard_right', 'assets/beard_right.png');
    game.load.image('beard_top', 'assets/beard_top.png');
    game.load.image('beard_bottom', 'assets/beard_bottom.png');
    game.load.image('blood_left', 'assets/blood_left.png');
    game.load.image('blood_right', 'assets/blood_right.png');
    game.load.image('blood_top', 'assets/blood_top.png');
    game.load.image('blood_bottom', 'assets/blood_bottom.png');
    game.load.image('blood_body', 'assets/blood_body.png');    

    game.load.image('eyes', 'assets/eyes.png');
    game.load.image('eyes_hurt', 'assets/eyes_hurt.png');


    for (var i = 1; i <= 6; i++){
        let name = `shave${i}`
        let path = `assets/audio/${name}.mp3`;
        game.load.audio(name, path)
        shave_names.push(name);
    }
    game.load.audio('polka', 'assets/audio/polka.mp3');
    game.load.audio('ouch', 'assets/audio/ouch.mp3');
    game.load.audio('cheer', 'assets/audio/cheer.mp3');

}

var bmd;
var sound;
var beard;
var music;
var last_x;
var last_y;
var injured = false;
var blood;
var timer;
var released = true;
var ouch;
var sheet_dirty = false;
var x_thresh;
var y_thresh;
var intro = true;
var cheer;
var button;

function create() {

    bmd = game.make.bitmapData(width, height);
    beard = game.make.bitmapData(width, height);
    beard.copy('beard');
    beard_left = game.make.bitmapData(width, height);
    beard_left.copy('beard_left');
    beard_right = game.make.bitmapData(width, height);
    beard_right.copy('beard_right');
    beard_top = game.make.bitmapData(width, height);
    beard_top.copy('beard_top');
    beard_bottom = game.make.bitmapData(width, height);
    beard_bottom.copy('beard_bottom');
    beard.update();
    beard_left.update();
    beard_right.update();
    beard_top.update();
    beard_bottom.update();

    bmd.copy('background');
    bmd.addToWorld();

    button = game.add.button(275, 175, 'start', start, this);
    button.input.useHandCursor = false;

    for (var i = 0; i < shave_names.length; i++) {
        shaves.push(game.add.audio(shave_names[i]));
    }
    music = game.add.audio('polka');
    ouch = game.add.audio('ouch');
    cheer = game.add.audio('cheer');

    timer = game.time.create(false);

    check_orientation()
}

function createText(msg, delay=true) {

    text = game.add.text(game.world.centerX, game.world.centerY, msg);
    text.anchor.setTo(0.5);

    text.font = 'Fontdiner Swanky';
    text.fontSize = 60;

    //  If we don't set the padding the font gets cut off
    //  Comment out the line below to see the effect
    text.padding.set(10, 16);

    grd = text.context.createLinearGradient(0, 0, 0, text.canvas.height);
    grd.addColorStop(0, '#BC0707');
    grd.addColorStop(1, '#C66809');
    text.fill = grd;

    text.align = 'center';
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    if (delay) {
        timer.add(3500, end_intro, this);
        timer.start();
    }

}

function end_intro() {
    intro = false;
    text.destroy();
}

function start() {
    game.input.addMoveCallback(paint, this);
    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this)
    music.loopFull(0.05);
    button.destroy();
    createText("Please help\nme shave!!");
    game.canvas.style.cursor ="url('assets/blade.png'), auto";
}

function check_orientation() {
    if (navigator.userAgent.includes('iPhone') ||
        navigator.userAgent.includes('Android')) {
        x_thresh = default_x * 1.3;
        y_thresh = default_y * 1.3;
    } else {
        x_thresh = default_x;
        y_thresh = default_y;
    }
}

function paint(pointer, x, y) {
    if (intro || !pointer.isDown || injured) {
        return;
    }
    x = Math.floor(x);
    y = Math.floor(y);

    if (!released && (Math.abs(last_x - x) + 1 > x_thresh || Math.abs(last_y - y) + 1 > y_thresh)) {
        set_injury(x, y);
    }

    for(var i = 0; i < 30; i++) {
        for(var j = 0; j < 10; j++) {
            if (beard.getPixel32(x +i, y+j) != 0) {
                beard.setPixel32(x + i, y + j, 0, 0, 0, 0, false);
            }
        }
    }
    beard.setPixel32(x + i, y + j, 0, 0, 0, 0, true);
    beard.update();

    last_x = x;
    last_y = y;
    released = false;
}

function set_injury(x, y) {
    injured = true;
    if (beard_left.getPixel32(x, y) != 0) {
        blood = 'blood_left';
    } else if (beard_right.getPixel32(x, y) != 0) {
        blood = 'blood_right';
    } else if (beard_top.getPixel32(x, y) != 0) {
        blood = 'blood_top';
    } else if (beard_bottom.getPixel32(x, y) != 0) {
        blood = 'blood_bottom';
        sheet_dirty = true;

    }
    timer.add(1000, recover, this);
    timer.start();
    shaves[sound].stop();
    ouch.play('', 0, 0.2);
}

function recover() {
    injured = false;
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function onDown(pointer) {
    if (intro) {
        return;
    }
    sound = getRandom(0, shaves.length);
    shaves[sound].play();
}

function onUp(pointer) {
    if (intro) {
        return;
    }
    shaves[sound].stop();
    released = true;
}

var done = false;

function update () {
    bmd.copy('background');
    bmd.copy('chair');
    bmd.copy('body');
    bmd.copy(beard);
    if (injured) {
        bmd.copy('eyes_hurt');
        bmd.copy(blood);
    } else {
        bmd.copy('eyes');
    }
    if (sheet_dirty) {
        bmd.copy('blood_body');
    }

    var pixels = 0;
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            if (beard.getPixel32(i, j) > 0) {
                pixels++;
            }
        }
    }

    if (!done && pixels < 500) {
        intro = true;
        createText('Thank You!!!!', false);
        music.stop();
        cheer.play();
        done = true;
    }
}
