const express = require("express");   
const http = require("http"); 
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);  // Create an HTTP server
const wss = new WebSocket.Server({ server });

let players = {};
let connections = {};

wss.on("connection", (ws) => {
    let playerID = null;

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "newPlayer") {
            playerID = uuidv4();
            players[playerID] = { x: 0, y: 1.6, z: 0 };
            connections[playerID] = ws;

            ws.send(JSON.stringify({ type: "setID", id: playerID }));

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "newPlayer", id: playerID, position: players[playerID] }));
                }
            });
        }

        if (data.type === "reconnect") {
            playerID = data.id;

            if (players[playerID]) {
                ws.send(JSON.stringify({ type: "init", players }));
            }
            else {
                playerID = uuidv4();
                players[playerID] = { x: 0, y: 1.6, z: 0 };
                connections[playerID] = ws;
                ws.send(JSON.stringify({ type: "setID", id: playerID }));
            }
        }

        if (data.type === "update" && playerID) {
            players[playerID] = data.position;

            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "update", id: playerID, position: data.position }));
                }
            });
        }
    });

    ws.on("close", () => {
        if (playerID && players[playerID]) {
            delete connections[playerID];
        }
    });
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// Start the server on port 8080
server.listen(8080, () => {
    console.log("✅ Server is running on http://10.77.160.244:8080");
});