import { Packet, Shard } from './types'

interface Client {
    socket: WebSocket

    shard_handlers: {[key: string]: Function},

    id: string

    data: {[key: string]: any}

    inputs: string[]

}



export function ClientBuilder(
    this: Client,
    socket_url: string,

) {
    this.socket = new WebSocket(socket_url);


    this.shard_handlers = {
        SET_DATA_VALUE: (shard: Shard, self: Client) => { 
            if ( !(shard.data.client_id in self.data) ) {
                self.data[shard.data.client_id] = {};
            }

            self.data[shard.data.client_id][shard.data.key] = shard.data.value;
        },
        CREATE_INPUT: (shard: Shard, self: Client) => { self.inputs.push(shard.data); return self },
        SET_ID: (shard: Shard, self: Client) => { self.id = shard.data; return self },
    }

    this.socket.addEventListener('open', (opn: Event) => {
        console.log("Connected to " + socket_url + "!");
    })
    this.socket.addEventListener('close', (cls: CloseEvent) => {
        throw "Server closed the connection!"
    })

    let self=this;
    this.socket.addEventListener('message', (msg: MessageEvent) => {
        let raw_packet: string = msg.data;

        let packet: Packet = JSON.parse(raw_packet);

        for (let shard of packet) {

            self = self.shard_handlers[shard.type](shard, self);

        }
        
    })

    return this;
}

