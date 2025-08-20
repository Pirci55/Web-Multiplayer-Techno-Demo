import 'module-alias/register';
import { Server } from 'colyseus';
import { Main } from '@/rooms/main_room';

const server = new Server({
    devMode: false,
});

server.define('main_room', Main);
server.listen(2567);