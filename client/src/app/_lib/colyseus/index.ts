import { Client, Room } from 'colyseus.js';

/** Класс, статично создающий одно подлючение на весь клиент */
class Service {
    private static _instance: Service;
    private client!: Client;
    private room!: Room;

    // Подключение к серверу по умолчанию
    private readonly serverUrl: string = 'ws://127.0.0.1:2567';

    private constructor() { };

    public static async getInstance(): Promise<Service> {
        if (!Service._instance) {
            Service._instance = new Service();
            await Service._instance.initialize();
        };
        return Service._instance;
    };

    private async initialize(): Promise<void> {
        this.client = new Client(this.serverUrl);
    };

    public async joinRoom(roomName: string): Promise<Room> {
        if (!this.room) {
            this.room = await this.client.joinOrCreate(roomName);
        };

        return this.room;
    };

    public async leaveRoom(): Promise<void> {
        if (this.room) {
            await this.room.leave();
            this.room = undefined!;
        };
    };

    public sendMessage(type: string | number, data: any): void {
        if (!this.room) {
            throw new Error('Not connected to room');
        };
        this.room.send(type, data);
    };

    public getRoom(): Room | undefined {
        return this.room;
    };
};

export const ColyseusService = await Service.getInstance();
export type ColyseusRoom = Room;
export type ColyseusClient = Client;