var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('up', 'assets/up.png');
    game.load.image('down', 'assets/down.png');


}

var bmd;
var mask;
var masked;

function create() {

    game.stage.backgroundColor = '#2d2d2d';

    bmd = game.make.bitmapData(800, 600);
    mask = game.make.bitmapData(800, 600);
    masked = game.make.bitmapData(800, 600);
    bmd.addToWorld();

    game.input.addMoveCallback(paint, this);
}

function paint(pointer, x, y) {
    if (pointer.isDown) {
        for(var i = 0; i < 10; i++) {
            for(var j = 0; j < 10; j++) {
                mask.setPixel(x + i, y + j, 0, 0, 0);
            }
        }
    }
}

function update () {
    masked.alphaMask('down', mask);
    bmd.copy('up');
    bmd.copy(masked);
}
