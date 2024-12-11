import { Packet, Shard, Shard_Types } from './types'

export class ClientBuilder {
    socket: WebSocket

    shard_handlers: {[key: number|string]: Function}

    id: string

    data: {[key: string]: any}

    inputs: string[]

    constructor(socket_url: string){

        this.socket = new WebSocket(socket_url);
        this.data = {};
        this.inputs = []


        this.shard_handlers = {
            0: (shard: Shard, self: ClientBuilder) => { // SET_DATA_VALUE
                if ( !(shard.data.client_id in self.data) ) {
                    self.data[shard.data.client_id] = {};
                }

                self.data[shard.data.client_id][shard.data.key] = shard.data.value;
                return self;
            },
            1: (shard: Shard, self: ClientBuilder) => { self.inputs.push(shard.data); return self }, // CREATE_INPUT
            2: (shard: Shard, self: ClientBuilder) => { self.id = shard.data; return self }, // SET_ID
        }

        this.socket.addEventListener('open', (opn: Event) => {
            console.log("Connected to " + socket_url + "!");
        })
        this.socket.addEventListener('close', (cls: CloseEvent) => {
            console.error("Server closed the connection!")
            console.error(cls)
            throw "Server closed the connection!"
        })
        this.socket.addEventListener('error', console.error);

        let self=this;
        this.socket.addEventListener('message', (msg: MessageEvent) => {
            let raw_packet: string = msg.data;

            let packet: Packet = JSON.parse(raw_packet);



            for (let shard of packet) {
                self = this.shard_handlers[shard.type](shard, self);

            }
            
        })


    }
}

