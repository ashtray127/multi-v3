var ClientBuilder = (function () {
    function ClientBuilder(socket_url) {
        var _this = this;
        this.socket = new WebSocket(socket_url);
        this.data = {};
        this.inputs = [];
        this.shard_handlers = {
            0: function (shard, self) {
                if (!(shard.data.client_id in self.data)) {
                    self.data[shard.data.client_id] = {};
                }
                self.data[shard.data.client_id][shard.data.key] = shard.data.value;
                return self;
            },
            1: function (shard, self) { self.inputs.push(shard.data); return self; },
            2: function (shard, self) { self.id = shard.data; return self; },
        };
        this.socket.addEventListener('open', function (opn) {
            console.log("Connected to " + socket_url + "!");
        });
        this.socket.addEventListener('close', function (cls) {
            console.error("Server closed the connection!");
            console.error(cls);
            throw "Server closed the connection!";
        });
        this.socket.addEventListener('error', console.error);
        var self = this;
        this.socket.addEventListener('message', function (msg) {
            var raw_packet = msg.data;
            var packet = JSON.parse(raw_packet);
            for (var _i = 0, packet_1 = packet; _i < packet_1.length; _i++) {
                var shard = packet_1[_i];
                self = _this.shard_handlers[shard.type](shard, self);
            }
        });
    }
    return ClientBuilder;
}());
export { ClientBuilder };
