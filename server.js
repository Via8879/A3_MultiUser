const express = require("express");   
const http = require("http"); 
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);  // Create an HTTP server
const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", (ws) => {
    const playerID = uuidv4();
    console.log("A user connected: ${playerID}");

    players[playerID] = { x: 0, y: 1.6, z: 0 };

    ws.send(JSON.stringify({ type: "init" , players}));

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "newPlayer", id: playerID, position: players[playerID] }));

        }
    });

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "update") {
            players[playerID] = data.position;

            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "update", id: playerID, position: data.position }));
                }
            });
        }
    });

    ws.on("close", () => {
        console.log("A user disconnected: ${playerID}");
        delete players[playerID];

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "remove", id: playerID }));
            }
        });
    });
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// Start the server on port 8080
server.listen(8080, () => {
    console.log("✅ Server is running on http://localhost:8080");
});