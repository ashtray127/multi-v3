import { Packet, Shard, Shard_Types } from './types';
import { WebSocketServer } from 'ws';

export interface Server {
    wss: WebSocketServer
    client_data: {[key: string]: any}
    inputs: {[key: string]: Function}
    server: Server
}

export function ServerBuilder(
    this: any,
    port: number,
    client_data: {[key: string]: any},
    inputs: {[key: string]: Function}

) {
    this.wss = new WebSocketServer({ port: port })

    this.client_data = client_data;
    this.inputs = inputs;

    let server=this;
    this.wss.on('connection', (ws: WebSocket) => {
        
        let full = true;
        let id: string;

        for (let cli_id in server.client_data) {
            if (server.client_data[cli_id].connected) continue;

            id=cli_id;
            server.client_data[cli_id].connected = true;
            full=false;
        }

        if (full) {
            ws.close(1001, "The server is full!");
            return;
        }

        // INIT PACKET BEGIN -----------------------------------

        let init_packet: Packet = [];

        for (let client_id in server.client_data) {

            for (let key in server.client_data[client_id]) {

                init_packet.push({
                    type: Shard_Types.SET_DATA_VALUE,
                    data: {
                        client_id: client_id,
                        key: key,
                        value: server.client_data[client_id][key]
                    }
                });

            }

        }

        for (let input in server.inputs) {
            init_packet.push({
                type: Shard_Types.CREATE_INPUT,
                data: input
            });
        }

        let raw_init_packet: string = JSON.stringify(init_packet);
        ws.send(raw_init_packet);


        // INIT PACKET END ------------------------------------

        ws.addEventListener('message', (msg: MessageEvent) => {
            let raw_packet = msg.data;
            let packet: Packet = JSON.parse(raw_packet);

            for (let shard of packet) {
                if ( shard.type !== Shard_Types.INPUT_VALUE ){
                    console.error("Client gave invalid shard!")
                    continue;
                }

                server = server.inputs[shard.data.input_id](server, shard.data.value);

            }
        })




    })


    return server;
}