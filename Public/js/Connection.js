const socket = new WebSocket("ws://localhost:8080");

let player = document.getElementById("player");
let players = {};

setInterval(() => {
    let position = player.object3D.position;
    socket.send(JSON.stringify({ type: "update", position: { x: position.x, y: position.y, z: position.z } }));

}, 100);

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);

    if (data.type === "init") {
        Object.keys(data.players).forEach(id = > createRemotePlayer(id, data.players[id]));

    }

    if (data.type === "update") {
        if (!players[data.id]) {
            createRemotePlayer(data.id, data.position);

        }
        updateRemotePlayer(data.id, data.position);
    }

    if (data.type == "remouve") {
        removeRemotePlayer(data.id);
    }
};

function createRemotePlayer(id, position) {
    let scene = document.querySelector("a-scene");
    let newPlayer = document.createElement("a-entity");
    newPlayer.setAttribute("geometry", "primitive: box");
    newPlayer.setAttribute("material", "color: blue");
    newPlayer.setAttribute("position", '${position.x} ${position.y} ${position.z}');
    newPlayer.setAttribute("id", id);
    scene.appendChild(newPlayer);
    players[id] = newPlayer;
}

function updateRemotePlayer(id, position) {
    if (players[id]) {
        players[id].setAttribute("position", '${poisition.x ${position.y ${position.z}');

    }
}

function removeRemotePlayer(id) {
    if (players[id]) {
        players[id].remove();
        delete players[id];
    }
}