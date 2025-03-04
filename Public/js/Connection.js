const socket = new WebSocket("ws://localhost:8080");

let scene = document.querySelector("a-scene");
let objects = [];
let sphere;
let score = {};
let scoreBoard;

socket.onopen = () => {
    console.log("Connected to Websocket server");
};

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);

    if (data.type === "init") {
        data.objects.forEach((obj) => addStackObjects(obj));
        placeSphere(data.sphere.position);
        updateScoreBoard(data.score);

    }

    if (data.type === "stackObject") {
        addStackObjects(data.object);

    }

    if (data.type == "GotSphere") {
        placeSphere(data.sphere.position);
        updateScoreBoard(data.score);
    }
};


function addStackObjects(object) {
    let newBlock = document.createElement("a-box");
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
                id: playerID
            }));
        });
    }
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
            console.log("blue cube clicked");

            let newObject = {
                position: randomPosition()
            };

            console.log("Blue cube clicked!");
            socket.send(JSON.stringify({
                type: "stackObject", 
                object: newObject
            }));
        });

    } 
    else {
        console.error("error could not find stack-object");
    }
});

function randomPosition() {
    return {
        x: (Math.random() * 8) - 4,
        y: 1.5,
        z: (Math.random() * 8) - 4
    };
}