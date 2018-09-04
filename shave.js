var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });
var shave_names = [];
var shaves = [];

function preload() {

    game.load.image('up', 'assets/up.png');
    game.load.image('down', 'assets/down.png');

    for (var i = 1; i <= 6; i++){
        let name = `shave${i}`
        let path = `assets/audio/${name}.mp3`;
        game.load.audio(name, path)
        shave_names.push(name);
    }

}

var bmd;
var mask;
var masked;
var sound;

function create() {

    game.stage.backgroundColor = '#2d2d2d';

    bmd = game.make.bitmapData(800, 600);
    mask = game.make.bitmapData(800, 600);
    masked = game.make.bitmapData(800, 600);
    bmd.addToWorld();

    for (var i = 0; i < shave_names.length; i++) {
        shaves.push(game.add.audio(shave_names[i]));
    }

    // need to give mp3 time to decode
    game.sound.setDecodedCallback(shaves, start, this);

}

function start() {
    game.input.addMoveCallback(paint, this);
    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this)
}

function paint(pointer, x, y) {
    if (pointer.isDown) {
        for(var i = 1; i < 10; i++) {
            for(var j = 1; j < 10; j++) {
                mask.setPixel(x + i, y + j, 0, 0, 0, false);
            }
        }
        mask.setPixel(x, y, 0, 0, 0, true);
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
}

function update () {
    masked.alphaMask('down', mask);
    bmd.copy('up');
    bmd.copy(masked);
}
