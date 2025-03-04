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

wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    console.log("New WebSocket connection established");
    const playerID = guid();

    players[playerID] = {
        connection,
        position: { x:Math.random() * 5, y: 1.5, z: Math.random() * 5 }
    };

    console.log(`Mewplayer connected: ${playerID}`);

    connection.send(JSON.stringify({ type: "init", players: getPlayersData() }));

    ShowNew({
        type: "newPlayer",
        id: playerID,
        position: players[playerID].position
    });

    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data);

        if (result.type === "update") {
            players[playerID].position = result.position;
            ShowNew({ 
                type: "update",
                id: playerID,
                position: result.position
            }, playerID);
        }

    });

    connection.on("close", () => {
        console.log(`Player disconnected: ${playerID}`);
        delete players[playerID];
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

function getPlayersData() {
    const PData = {};
    Object.keys(players).forEach((id) => {
        PData[id] = players[id].position;
    });
    return PData;

}

function ap4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

const guid = () => (ap4() + ap4() + "-" + ap4() + "-4" + ap4().substr(0,3) + "-" + ap4() + "-" + ap4() + ap4() + ap4()).toLowerCase();