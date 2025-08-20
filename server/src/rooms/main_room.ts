import { Room, Client } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';

export class Player extends Schema {
    @type('boolean') flipX: boolean = false;
    @type('number') x: number = 0;
    @type('number') y: number = 0;
}

export class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}

export class Main extends Room<State> {
    onCreate(options: any) {
        this.state = new State();

        // Чат
        this.onMessage('new_message', (client, data) => {
            this.broadcast('broadcast_message', { content: client.sessionId + ': ' + data.content });
        });

        // Передвижение
        this.onMessage('player_update', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return console.log('Ошибка обновления позиции игрока: ' + client.sessionId);
            player.x = data.x;
            player.y = data.y;
            player.flipX = data.flipX;

            this.broadcast('player_update', {
                sessionId: client.sessionId,
                x: player.x,
                y: player.y,
                isMove: data.isMove,
                flipX: data.flipX,
            }, { except: client });

            this.state.players.set(client.sessionId, player);
        });

        // Phaser готов
        this.onMessage('phaser_ready', (client: Client<any, any>) => {
            const playerList: Record<string, { x: number, y: number, flipX: boolean }> = {};

            this.state.players.forEach((player, sessionId) => {
                if (sessionId != client.sessionId) playerList[sessionId] = {
                    x: player.x,
                    y: player.y,
                    flipX: player.flipX,
                };
            });

            client.send('player_list', playerList);
        });
    };

    onJoin(client: Client, options: any) {
        const newPlayer = new Player();
        this.state.players.set(client.sessionId, newPlayer);

        this.broadcast(
            'player_join',
            { sessionId: client.sessionId, x: newPlayer.x, y: newPlayer.y },
            { except: client }
        );
    };

    onLeave(client: Client, consented: boolean) {
        this.broadcast('player_left', { sessionId: client.sessionId });
        this.state.players.delete(client.sessionId);
    };

    onDispose() {
        this.broadcast('room_dispose', { id: this.roomId });
    };
}