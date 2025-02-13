const express = require("express");   
const http = require("http"); 
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);  // Create an HTTP server

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("A user connected");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);

        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        console.log("A user disconnected");
    });
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// Start the server on port 8080
server.listen(8080, () => {
    console.log("✅ Server is running on http://localhost:8080");
});