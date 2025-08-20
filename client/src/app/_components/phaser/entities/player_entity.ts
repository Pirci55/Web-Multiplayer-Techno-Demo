import Phaser from 'phaser';

export class Player extends Phaser.Physics.Matter.Sprite {
    public isMove: boolean = false;
    private runMultiplier: number = 2;
    private baseSpeed: number = 5;
    private speed: number = 0;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };

    constructor(
        scene: Phaser.Scene,
        keys?: { [key: string]: Phaser.Input.Keyboard.Key },
    ) {
        super(scene.matter.world, 0, 0, 'player_idle');
        scene.add.existing(this);
        this.setIgnoreGravity(true);
        this.setFixedRotation();
        this.setDepth(10);
        this.setScale(7);

        this.keys = keys;
    }

    move() {
        if (this.keys) {
            const velocity = new Phaser.Math.Vector2();

            this.speed = this.keys.shift.isDown ? this.baseSpeed * this.runMultiplier : this.baseSpeed;
            if (this.keys.left.isDown) velocity.x -= 1;
            if (this.keys.right.isDown) velocity.x += 1;
            if (this.keys.up.isDown) velocity.y -= 1;
            if (this.keys.down.isDown) velocity.y += 1;

            // Нормализуем вектор (чтобы диагональное движение не было быстрее)
            if (velocity.length() > 0) {
                this.play('player_walk', true);
                velocity.normalize();
            } else {
                this.play('player_idle', true);
            };

            this.isMove = velocity.length() > 0;

            // Применяем скорость
            this.setVelocity(velocity.x * this.speed, velocity.y * this.speed);
        };

        // Поворот спрайта по направлению движения
        if (this.getVelocity().x > 0) this.setFlipX(false);
        else if (this.getVelocity().x < 0) this.setFlipX(true);
    };
}