import Phaser from 'phaser';

export default class extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    };

    preload() {
        const playerSpritesheetConfig = { frameWidth: 10, frameHeight: 10 };

        this.load.image('grass', 'sprites/grass.png');
        this.load.spritesheet('player_idle', 'sprites/player_idle.png', playerSpritesheetConfig);
        this.load.spritesheet('player_walk', 'sprites/player_walk.png', playerSpritesheetConfig);
    };

    create() {
        this.anims.create({
            key: 'player_walk',
            frames: this.anims.generateFrameNumbers('player_walk'),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player_idle'),
            frameRate: 1,
            repeat: 0
        });
        this.scene.start('MainScene');
    };
};