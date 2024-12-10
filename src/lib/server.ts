import { Packet, Shard, Shard_Types } from './types';
import { WebSocketServer } from 'ws';

interface Server {
    wss: WebSocketServer
    client_data: {[key: string]: any}
    inputs: string[]
}

export function ServerBuilder(
    this: Server,
    port: number,
    client_data: {[key: string]: any},
    inputs: string[]

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

        for (let client_id in this.client_data) {

            for (let key in this.client_data[client_id]) {

                init_packet.push({
                    type: Shard_Types.SET_DATA_VALUE,
                    data: {
                        client_id: client_id,
                        key: key,
                        value: this.client_data[client_id][key]
                    }
                });

            }

        }

        for (let input of this.inputs) {
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


            }
        })




    })


    return this;
}