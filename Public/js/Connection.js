const socket = new WebSocket("ws://localhost:8080");

let scene = document.querySelector("a-scene");
let objects = [];
let sphere;
let score = {};
let scoreBoard;
let playerRole;

socket.onopen = () => {
    console.log("Connected to Websocket server");
};

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);

    if (data.type === "init") {
        playerRole = data.role;
        console.log(`your role is: ${playerRole}`);

        showPlayerRole(playerRole);

        data.objects.forEach((obj) => addStackObjects(obj));
        placeSphere(data.sphere.position);
        updateScoreBoard(data.score);

    }

    if (data.type === "newPlayer") {
        console.log(`New player joined with role: ${data.role}`);
    }

    if (data.type === "stackObject") {
        addStackObjects(data.object);

    }

    if (data.type == "GotSphere") {
        placeSphere(data.sphere.position);
        updateScoreBoard(data.score);
    }

    if (data.type === "removeObject") {
        let removedBlock = document.querySelector(`[id='${data.objectID}']`);
        if (removedBlock) {
            removedBlock.parentNode.removeChild(removedBlock);
        }
    }
};


function addStackObjects(object) {
    let newBlock = document.createElement("a-box");
    newBlock.setAttribute("id", object.id);
    newBlock.setAttribute("position", `${object.position.x} ${object.position.y} ${object.position.z}`);
    newBlock.setAttribute("color", "white");
    newBlock.setAttribute("width", "1");
    newBlock.setAttribute("height", "1");
    newBlock.setAttribute("depth", "1");
    newBlock.setAttribute("class", "stackable");
    newBlock.setAttribute("grabbable", "");
    newBlock.setAttribute("dynamic-body", "mass: 1");
    scene.appendChild(newBlock);

}

function placeSphere(position){
    if (sphere) {
        sphere.setAttribute("position", `${position.x} ${position.y} ${position.z}`);
    }
    else{
        sphere = document.createElement("a-sphere");
        sphere.setAttribute("color", "yellow");
        sphere.setAttribute("radius", "0.5");
        sphere.setAttribute("position", `${position.x} ${position.y} ${position.z}`);
        sphere.setAttribute("class", "sphere");
        sphere.setAttribute("dynamic-body", "mass: 0");
        scene.appendChild(sphere);

        sphere.addEventListener("click", () => {
            console.log("sphere clicked");
            socket.send(JSON.stringify({ 
                type: "GetSphere", 
                id: socket.playerID
            }));
        });
    }
}

function showPlayerRole(role) {
    let roleText = document.createElement("a-entity");
    roleText.setAttribute("position", "0 2.5 -1");
    roleText.setAttribute("text", `value: Role: ${role.toUpperCase()}; color: white; width: 3; align: center`);
    roleText.setAttribute("id", "playerRoleDisplay");
    scene.appendChild(roleText);

}

function updateScoreBoard(scoreData) {
    if (!scoreBoard) {
        scoreBoard = document.createElement("a-entity");
        scoreBoard.setAttribute("position", "-2 3 -3");
        scoreBoard.setAttribute("text", `value: Score; color: white; width: 4`);
        scene.appendChild(scoreBoard);
    }
    let scoreText = "Score:\n";
    Object.keys(scoreData).forEach((id) =>{
        scoreText += `Player ${id}: ${scoreData[id]}\n`;
    });

    scoreBoard.setAttribute("text", `value: ${scoreText}; color: white; width: 4`);
}

document.addEventListener("DOMContentLoaded", () => {
    let stackCube = document.getElementById("stack-object");

    if (stackCube) {
        stackCube.addEventListener("click", () => {
            
            if (playerRole === "spawner") {
                let newObject = {
                    position: randomPosition()
                };
                socket.send(JSON.stringify({
                    type: "stackObject", 
                    object: newObject
                }));
            }else{
                console.log("you are not a spawner");
            }

        });

    } 
   
    scene.addEventListener("click", (event) => {
        let target = event.target;
        if (playerRole === "breaker" && target.classList.contains("stackable")) {
            socket.send(JSON.stringify({
                type: "breakObject",
                objectID: target.getAttribute("id")
            }));
        }
    });
});

function randomPosition() {
    return {
        x: (Math.random() * 8) - 4,
        y: 1.5,
        z: (Math.random() * 8) - 4
    };
}