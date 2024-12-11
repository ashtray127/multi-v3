import { ServerBuilder } from "../lib/server";
import type { Server } from "../lib/server";

ServerBuilder(
    8080,
    {
        player_1: {
            connected: false,
            pos: { x: 0, y: 0 }
        },
        player_2: {
            connected: false,
            pos: { x: 0, y: 0 }
        }
    },
    {
        "W_KEY": (server: Server, id: string, val: boolean) => {
            if (val) {
                server.client_data[id].pos.y--;
            }
            return server;
        },
        "S_KEY": (server: Server, id: string, val: boolean) => {
            if (val) {
                server.client_data[id].pos.y++;
            }
            return server;
        }
    }
)