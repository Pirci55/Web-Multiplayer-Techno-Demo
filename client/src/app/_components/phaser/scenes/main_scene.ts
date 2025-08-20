import Phaser from 'phaser';
import { Player } from '../entities/player_entity';
import { ColyseusService } from '@/app/_lib/colyseus';

export default class extends Phaser.Scene {
    private player!: Player;
    private worldSize!: { width: number, height: number };
    private otherPlayers!: Map<string, Player>;
    public keys!: {
        up: Phaser.Input.Keyboard.Key,
        down: Phaser.Input.Keyboard.Key,
        left: Phaser.Input.Keyboard.Key,
        right: Phaser.Input.Keyboard.Key,
        shift: Phaser.Input.Keyboard.Key,
    };

    constructor() {
        super('MainScene');

        this.worldSize = { width: 1000, height: 1000 };
        this.otherPlayers = new Map();
    };

    init() {
        if (this.input.keyboard) {
            this.keys = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            };
        } else {
            alert('no keyboard :(');
        };

        // Отключаем ввод с клавиатуры
        const chatInteractions = () => {
            if (!this.input.keyboard) return alert('no keyboard :(');

            this.input.keyboard.manager.enabled = !this.input.keyboard.manager.enabled;
            this.input.keyboard.resetKeys();
        };
        document.body.addEventListener('enable_input', chatInteractions);
        document.body.addEventListener('disable_input', chatInteractions);

        // netcode
        (async () => {
            const room = await ColyseusService.joinRoom('main_room');

            const addPlayer = (data: any) => {
                let otherPlayer = this.otherPlayers.get(data.sessionId);

                if (!otherPlayer) {
                    otherPlayer = new Player(this);
                    this.otherPlayers.set(data.sessionId, otherPlayer);
                };
            };

            // Добавляем игрока или игроков
            room.onMessage('player_join', addPlayer);
            room.onMessage('player_list', (data: any) => {
                for (const sessionId in data) {
                    addPlayer({ sessionId: sessionId, ...data[sessionId] });
                };
            });

            // Получаем новое состояние другого игрока
            room.onMessage('player_update', (data: any) => {
                const player = this.otherPlayers.get(data.sessionId);
                if (!player) return;

                // Устанавливаем анимацию
                if (data.isMove) player.play('player_walk', true);
                else player.play('player_idle', true);

                // Устанавливаем игрока в нужную позицию
                player.setFlipX(data.flipX);
                player.setPosition(data.x, data.y);
            });

            // Удаляем игрока
            room.onMessage('player_left', (data) => {
                if (!this.otherPlayers.has(data.sessionId)) return;

                this.otherPlayers.get(data.sessionId)!.destroy();
                this.otherPlayers.delete(data.sessionId);
            });

            // Сообщает серверу что клиент готов
            ColyseusService.sendMessage('phaser_ready', {});
        })();
    }

    create() {
        this.matter.world.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
        this.add.tileSprite(0, 0, this.worldSize.width, this.worldSize.height, 'grass')
            .setOrigin(0, 0)
            .setTileScale(5, 4.25);

        this.player = new Player(this, this.keys)
            .setPosition(this.worldSize.width * Math.random(), this.worldSize.height * Math.random());
        this.cameras.main.zoomY = this.cameras.main.zoomX = 0.75
        this.cameras.main.startFollow(this.player);
    };

    update(time: number, delta: number) {
        this.player.move();

        // FIXME: Спам запросами
        ColyseusService.sendMessage('player_update', {
            x: this.player.x,
            y: this.player.y,
            isMove: this.player.isMove,
            flipX: this.player.flipX,
        });
    };
};