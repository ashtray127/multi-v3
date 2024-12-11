import { ServerBuilder } from "../lib/server";
var serv = ServerBuilder(8080, {
    player_1: {
        connected: false,
        pos: { x: 0, y: 0 }
    },
    player_2: {
        connected: false,
        pos: { x: 0, y: 0 }
    }
}, {
    "W_KEY": function (server, val) {
        return server;
    },
    "S_KEY": function (server, val) {
        return server;
    }
});
