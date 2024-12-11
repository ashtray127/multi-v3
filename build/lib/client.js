export function ClientBuilder(socket_url) {
    this.socket = new WebSocket(socket_url);
    this.shard_handlers = {
        SET_DATA_VALUE: function (shard, self) {
            if (!(shard.data.client_id in self.data)) {
                self.data[shard.data.client_id] = {};
            }
            self.data[shard.data.client_id][shard.data.key] = shard.data.value;
        },
        CREATE_INPUT: function (shard, self) { self.inputs.push(shard.data); return self; },
        SET_ID: function (shard, self) { self.id = shard.data; return self; },
    };
    this.socket.addEventListener('open', function (opn) {
        console.log("Connected to " + socket_url + "!");
    });
    this.socket.addEventListener('close', function (cls) {
        throw "Server closed the connection!";
    });
    var self = this;
    this.socket.addEventListener('message', function (msg) {
        var raw_packet = msg.data;
        var packet = JSON.parse(raw_packet);
        for (var _i = 0, packet_1 = packet; _i < packet_1.length; _i++) {
            var shard = packet_1[_i];
            self = self.shard_handlers[shard.type](shard, self);
        }
    });
    return this;
}
