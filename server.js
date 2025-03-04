const http = require("http"); 
const express = require("express");
const path = require("path");
const WebSocketServer = require("websocket").server;

const app = express();


app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req,res)=> res.sendFile(path.join(__dirname, "public", "index.html")));

const server = http.createServer(app);
server.listen(8080, ()=>console.log("listeing on http port 8080"))

const wsServer = new WebSocketServer({ httpServer: server});

const players = {};
const objects = [];

let sphere =  { position: randomPosition() };
const score = {};

wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    console.log("New WebSocket connection established");
    const playerID = guid();

    players[playerID] = { connection };

    score[playerID] = 0;

    console.log(`Newplayer connected: ${playerID}`);

    connection.send(
        JSON.stringify({ 
            type: "init", 
            objects,
            sphere,
            score
        })
    );

    ShowNew({
        type: "newPlayer",
        id: playerID
    }, playerID);

    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data);

        // object stacking 
        if (result.type === "stackObject") {
            objects.push(result.object);
            ShowNew({ 
                type: "stackObject",
                object: result.object
            });
        }

        if (result.type === "GetSphere") {
            if (!score[result.id]) score[result.id] = 0; 
            score[result.id] += 1;
                
            sphere.position = randomPosition();

            ShowNew({ 
                type: "GotSphere",
                sphere,
                score
            });
        }

    });

    connection.on("close", () => {
        console.log(`Player disconnected: ${playerID}`);
        delete players[playerID];
        delete score[playerID];
        ShowNew({ type: "remove", id: playerID });
    });


});

function ShowNew(data, UserID = null) {
    Object.keys(players).forEach((id) => {
        if (id !== UserID) {
            players[id].connection.send(JSON.stringify(data));
        }
    });
}

function randomPosition() {
    let x, z;
    do {
        x = (Math.random() * 12) - 6;
        z = (Math.random() * 12) - 6;
    } while (Math.abs(x) < 2 && Math.abs(z) < 2);
    return { x: x, y: 1.5, z: z };
}

function ap4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

const guid = () => (ap4() + ap4() + "-" + ap4() + "-4" + ap4().substr(0,3) + "-" + ap4() + "-" + ap4() + ap4() + ap4()).toLowerCase();