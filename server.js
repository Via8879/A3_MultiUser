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
let objects = [];

let sphere =  { position: randomSpherePosition() };
const score = {};
const roles = ["spawner", "breaker"];

wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    console.log("New WebSocket connection established");
    const playerNumber = Object.keys(players).length + 1;
    const playerID = `Player ${playerNumber}`;

    let role = Object.keys(players).length % 2 === 0 ? "spawner" : "breaker";

    players[playerID] = { connection, role };

    score[playerID] = 0;

    console.log(`Newplayer connected: ${playerID}`);

    connection.send(
        JSON.stringify({ 
            type: "init", 
            id: playerID,
            objects,
            sphere,
            score,
            role
        })
    );

    ShowNew({
        type: "newPlayer",
        id: playerID,
        role
    }, playerID);

    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data);

        // object stacking 
        if (result.type === "stackObject") {
            let newObject = {
                id: guid(),
                position: randomCubePosition(),
                color: getRandomColor()
            };
            objects.push(newObject);
            ShowNew({ 
                type: "stackObject",
                object: newObject
            });
        }

        if (result.type === "GetSphere") {
            if (players[result.id]) {
                score[result.id] += 1;
            }else{
                console.log(`Unknown player ID: ${result.id}`);
            }
                
            sphere.position = randomPosition();

            ShowNew({ 
                type: "GotSphere",
                sphere,
                score
            });
            console.log(`player ${result.id} found the sphere`);
        }

        if (result.type === "breakObject") {
            objects = objects.filter(obj => obj.id !== result.objectID);
            ShowNew({
                type: "removeObject",
                objectID: result.objectID
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

function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomSpherePosition() {
    let x, z;
    do {
        x = (Math.random() * 100) - 50;
        z = (Math.random() * 100) - 50;
    } while (Math.abs(x) < 10 && Math.abs(z) < 10);
    return { x: x, y: 1.5, z: z };
}

function randomCubePosition() {
    let x, z;
    do {
        x = (Math.random() * 40) - 20;
        z = (Math.random() * 40) - 20;
    } while (Math.abs(x) < 5 && Math.abs(z) < 5);
    return { x: x, y: 1.5, z: z };

}

function ap4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

const guid = () => (ap4() + ap4() + "-" + ap4() + "-4" + ap4().substr(0,3) + "-" + ap4() + "-" + ap4() + ap4() + ap4()).toLowerCase();