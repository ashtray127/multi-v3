var ClientBuilder = null;
import('../lib/client.js').then((val) => {
    ClientBuilder = val.ClientBuilder;
});

var client;

function setup() {
    client = new ClientBuilder('http://localhost:8080');
    createCanvas(400,400);
}

function draw() {
    background(255,255,255);
    console.log(frameCount)
    let input_packet = []

    if ("inputs" in client) {
        for (let input_id of client.inputs) {
            switch (input_id) {
                case "W_KEY": 
                    input_packet.push({
                        type: 3, 
                        data: {input_id: "W_KEY", value: keyIsDown(87)} 
                    })
                    break;
                case "S_KEY":
                    input_packet.push({
                        type: 3,
                        data: {input_id: "S_KEY", value: keyIsDown(83)}
                    })
            }
        }
        console.log(client)

        let raw_packet = JSON.stringify(input_packet);

        console.log(client.socket.readyState)
        if (client.socket.readyState != 0) {    
            client.socket.send(raw_packet);
        }
        
        if (Object.keys(client.data).includes("player_1")) {
            fill(0,0,0);
            circle(200, client.data.player_1.pos.y), 50);
        }
    }


}