const width = 800;
const height = 600;
const default_x = 6;
const default_y = 9

var shave_names = [];
var shaves = [];
var game;
var injured = false;
var injury_count = 5;
var score = 0;
var offset;

function getTime() {
    return Math.floor(this.game.time.totalElapsedSeconds() - offset);
}


WebFontConfig = {
    google: {
      families: ['Fontdiner Swanky']
    }
};


function check_orientation() {
    if (navigator.userAgent.includes('iPhone') ||
        navigator.userAgent.includes('Android')) {
        x_thresh = default_x * 1.8;
        y_thresh = default_y * 1.8;
    } else {
        x_thresh = default_x;
        y_thresh = default_y;
    }
}


function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}


function onDown(pointer) {
    sound = getRandom(0, shaves.length);
    shaves[sound].play();
}


function onUp(pointer) {
    shaves[sound].stop();
    released = true;
}


var bmd;
var sound;
var beard;
var music;
var last_x;
var last_y;
var blood;
var released = true;
var ouch;
var sheet_dirty = false;
var x_thresh;
var y_thresh;
var cheer;
var boo;
var button;


function createText(msg) {

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

}


var start = {
    preload: () => {
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        game.load.image('start', 'assets/start.png');
        game.load.image('background', 'assets/background.png');
    },

    create: () => {
        bmd = game.make.bitmapData(width, height);
        bmd.copy('background');
        bmd.addToWorld();

        button = game.add.button(0, 0, 'start', () => {game.state.start('intro')}, this);
        button.input.useHandCursor = false;
    }
}


function end_intro() {
    text.destroy();
    game.state.start('play')
}


var intro = {
    preload: () => {
        createText("Loading...");
        game.load.image('play_again', 'assets/play_again.png');
        game.load.image('lose_face', 'assets/lose_face.png');
        game.load.image('lose', 'assets/lose.png');

        game.load.image('win', 'assets/win.png');
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
        game.load.audio('boo', 'assets/audio/boo.mp3');
    },

    create: () => {
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
        for (var i = 0; i < shave_names.length; i++) {
            shaves.push(game.add.audio(shave_names[i]));
        }
        music = game.add.audio('polka');
        ouch = game.add.audio('ouch');
        cheer = game.add.audio('cheer');
        boo = game.add.audio('boo');

        check_orientation()


        music.loopFull(0.05);
        button.destroy();
        text.destroy();
        createText("Please help\nme shave!!");
        timer = game.time.create(true);
        timer.add(3500, end_intro, this);
        timer.start();
        injured = false;
        released = true;
        sheet_dirty = false;
        injury_count = 5;
    }
}


function paint(pointer, x, y) {
    console.log(pointer.speed);
    if (!pointer.isDown || injured) {
        return;
    }
    x = Math.floor(x);
    y = Math.floor(y);

    if (!released
        && (Math.abs(last_x - x) + 1 > x_thresh || Math.abs(last_y - y) + 1 > y_thresh)
    ) {
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

    last_x = x;
    last_y = y;
    released = false;
}


var play = {

    create: () => {
        offset = this.game.time.totalElapsedSeconds() ;
        beard.copy('beard');
        beard.update();
        game.input.addMoveCallback(paint, this);
        game.input.onDown.add(onDown, this);
        game.input.onUp.add(onUp, this)
        bmd.copy('background');
        bmd.addToWorld();
        game.canvas.style.cursor ="url('assets/blade.png'), auto";
    },

    update: () => {
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

        if (pixels < 500) {
            game.state.start('win')
        }
    },

    render: () => {
        game.debug.text(`time: ${getTime()}`, 32, 32, 'black');
        game.debug.text(`chances: ${injury_count}`, 32, 50, 'black');
    }
}


function set_injury(x, y) {
    blood = ''

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

    if (blood === '') {
        return;
    }

    injured = true;
    if (--injury_count == 0) {
        game.state.start('lose');
    }
    timer = game.time.create(true);
    timer.add(1000, () => {injured = false}, this);
    timer.start();
    shaves[sound].stop();
    ouch.play('', 0, 0.2);
}

var win = {
    create: () => {
        music.stop();
        cheer.play();
        bmd.copy('background');
        bmd.copy('chair');
        bmd.copy('body');
        bmd.copy(beard);
        bmd.copy('eyes');
        bmd.copy('win')
        if (sheet_dirty) {
            bmd.copy('blood_body');
        }
        bmd.addToWorld();
        createText(`Your time:\n${getTime()}s!`);
        timer = game.time.create(true);
        timer.add(5000, () => {game.state.start('again')}, this);
        timer.start();
    }
}


var lose = {
    create: () => {
        music.stop();
        boo.play('', 0, 0.2);
        bmd.copy('background');
        bmd.copy('chair');
        bmd.copy('lose_face');
        if (sheet_dirty) {
            bmd.copy('blood_body');
        }
        bmd.copy(beard);
        bmd.copy('lose')
        bmd.addToWorld();
        timer = game.time.create(true);
        timer.add(5000, () => {game.state.start('again')
        }, this);
        timer.start();
    }
}

var again = {
    create: () => {
        bmd.copy('background');
        bmd.addToWorld();
        button = game.add.button(0, 0, 'play_again', () => {
            boo.stop();
            cheer.stop();
            game.state.start('intro')
        }, this);
        button.input.useHandCursor = false;
    }
}

game = new Phaser.Game(width, height, Phaser.CANVAS, 'shaving');

game.state.add('start', start);
game.state.add('intro', intro);
game.state.add('play', play);
game.state.add('win', win);
game.state.add('lose', lose);
game.state.add('again', again);

game.state.start('start');


