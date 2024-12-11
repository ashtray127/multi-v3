import { Shard_Types } from './types';
import { WebSocketServer } from 'ws';
export function ServerBuilder(port, client_data, inputs) {
    this.wss = new WebSocketServer({ port: port });
    this.client_data = client_data;
    this.inputs = inputs;
    var server = this;
    this.wss.on('connection', function (ws) {
        var full = true;
        var id;
        for (var cli_id in server.client_data) {
            if (server.client_data[cli_id].connected)
                continue;
            id = cli_id;
            server.client_data[cli_id].connected = true;
            full = false;
        }
        if (full) {
            ws.close(1001, "The server is full!");
            return;
        }
        var init_packet = [];
        for (var client_id in server.client_data) {
            for (var key in server.client_data[client_id]) {
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
        for (var input in server.inputs) {
            init_packet.push({
                type: Shard_Types.CREATE_INPUT,
                data: input
            });
        }
        var raw_init_packet = JSON.stringify(init_packet);
        ws.send(raw_init_packet);
        ws.addEventListener('message', function (msg) {
            var raw_packet = msg.data;
            var packet = JSON.parse(raw_packet);
            for (var _i = 0, packet_1 = packet; _i < packet_1.length; _i++) {
                var shard = packet_1[_i];
                if (shard.type !== Shard_Types.INPUT_VALUE) {
                    console.error("Client gave invalid shard!");
                    continue;
                }
                server = server.inputs[shard.data.input_id](server, shard.data.value);
            }
        });
    });
    return server;
}
