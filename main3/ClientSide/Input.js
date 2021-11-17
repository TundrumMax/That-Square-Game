let mouse = {
    x: 0,
    y: 0,
    down: false,
    wasDown: false, //used in loops for eh
    oldX: 0,
    oldY: 0,
    mouseMoved: false //so awkward
}
let keys = [];

function SetupEventListeners(room) {
    document.onmousedown = () => {
        mouse.down = true;
    }
    document.onmouseup = () => {
        mouse.down = false;
    }

    document.onmousemove = e => {
        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.mouseMoved = true;
    }

    document.onkeydown = e => {
        let k = e.key.toLowerCase(); //prevents weird stuff with holding shift
        keys[k] = true;
    }
    document.onkeyup = e => {
        let k = e.key.toLowerCase();
        keys[k] = false;
    }
}

let keyboardCommands = { //used to check if a keyboard command has already been run
    undo: false,
    enter: false
}


function Input(keys, mouse, roomContainer, socket) {
    let room = roomContainer.room;
    if (!chatOpen) {
        if (keys["arrowup"] || keys["w"]) {
            room.players[0].y--;
        }
        if (keys["arrowleft"] || keys["a"]) {
            room.players[0].x--;
        }
        if (keys["arrowdown"] || keys["s"]) {
            room.players[0].y++;
        }
        if (keys["arrowright"] || keys["d"]) {
            room.players[0].x++;
        }

        if (keys["z"] && keys["control"] && room.inputs[3]) {
            if (!keyboardCommands.undo) {
                room.players[0].Undo();
                keyboardCommands.undo = true;
            }
        } else {
            keyboardCommands.undo = false;
        }
        //is here because i have to check for the room's inputs and i dont want the room data to be easily accessible
        if (mouse.down && !mouse.wasDown && room.inputs[0]) {
            room.players[0].MouseDown(mouse.x, mouse.y);
        }
        if (!mouse.down && mouse.wasDown && room.inputs[1]) {
            room.players[0].MouseUp(mouse.x, mouse.y);
        }
        if (mouse.down && mouse.mouseMoved && room.inputs[2]) {
            room.players[0].MouseMove(mouse.x, mouse.y);
        }
    }
    if (keys["enter"]) {
        if (!keyboardCommands.enter) {
            ToggleChat(socket, roomContainer);
            keyboardCommands.enter = true;
        }
    } else {
        keyboardCommands.enter = false;
    }


}