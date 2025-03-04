const socket = new WebSocket("ws://localhost:8080");

let player = document.getElementById("player");
let players = {};
let playerID = null;

socket.onopen = () => {
    console.log("Connected to Websocket server");
};

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);

    if (data.type === "init") {
        console.log("Initilazing players", data.players);
        Object.keys(data.players).forEach(id => createRemotePlayer(id, data.players[id]));

    }

    if (data.type === "newPlayer") {
        console.log(`New player Joined: ${data.id}`);
        createRemotePlayer(data.id, data.position);

    }

    if (data.type === "update") {
        updateRemotePlayer(data.id, data.position);
    }

    if (data.type == "remove") {
        removeRemotePlayer(data.id);
    }
};

setInterval(() => {
    if (player) {
        let position = player.getAttribute("position");
        socket.send(JSON.stringify({ 
            type: "update", 
            position: { x: position.x, y: position.y, z: position.z } 
        
        }));
    }

}, 100);


function createRemotePlayer(id, position) {
    if (!players[id]) {
        let scene = document.querySelector("a-scene");
        let newPlayer = document.createElement("a-entity");
        newPlayer.setAttribute("color", "blue");
        newPlayer.setAttribute("position", `${position.x} ${position.y} ${position.z}`);
        newPlayer.setAttribute("id", id);
        scene.appendChild(newPlayer);
        players[id] = newPlayer;
    }
    
}

function updateRemotePlayer(id, position) {
    if (players[id]) {
        players[id].setAttribute("position", `${position.x} ${position.y} ${position.z}`);

    }
}

function removeRemotePlayer(id) {
    if (players[id]) {
        players[id].remove();
        delete players[id];
    }
}