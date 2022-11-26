let mouse = {
    x: 0,
    y: 0,
    down: false,
    wasDown: false, //used in loops for eh
    oldX: 0,
    oldY: 0,
    mouseMoved: false, //so awkward
    scroll: 0,
    scrolled: false
}
let keys = [];

function SetupEventListeners(roomContainer, socket) {
    document.onmousedown = e => {
        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.down = true;

    }
    document.onmouseup = e => {
        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
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
        if (e.repeat) {
            return;
        }
        let key = e.key.toLowerCase(); //prevents weird stuff with holding shift
        if (!chatOpen) {

            let i = 0;
            switch (key) {
                case "arrowleft":
                case "a":
                    i = 1;
                    break;
                case "arrowright":
                case "d":
                    i = 2;
                    break;
                case "arrowup":
                case "w":
                    i = 4;
                    break;
                case "arrowdown":
                case "s":
                    i = 8;
                    break;
            }

            roomContainer.room.players[0].keys |= i;


            if (!enableDevMode)
                socket.emit("UpdateInput", i, true);
        }
        keys[key] = true;
    }
    document.onkeyup = e => {
        if (e.repeat) {
            return;
        }
        let key = e.key.toLowerCase();
        if (!chatOpen) {

            let i = 0;
            switch (key) {
                case "arrowleft":
                case "a":
                    i = 1;
                    break;
                case "arrowright":
                case "d":
                    i = 2;
                    break;
                case "arrowup":
                case "w":
                    i = 4;
                    break;
                case "arrowdown":
                case "s":
                    i = 8;
                    break;
            }
            roomContainer.room.players[0].keys &= ~i;

            if (!enableDevMode)
                socket.emit("UpdateInput", i, false);
        }
        keys[key] = false;
    }
    document.onwheel = e => {
        mouse.scroll = e.deltaY >= 0 ? 1 : -1;
        mouse.scrolled = true;
    }
}

let keyboardCommands = { //used to check if a keyboard command has already been run
    undo: false,
    enter: false
}


function Input(keys, mouse, roomContainer, socket, camera) {
    let room = roomContainer.room;
    if (!chatOpen) {
        // if (keys["arrowup"] || keys["w"]) {
        //     room.players[0].y--;
        // }
        // if (keys["arrowleft"] || keys["a"]) {
        //     room.players[0].x--;
        // }
        // if (keys["arrowdown"] || keys["s"]) {
        //     room.players[0].y++;
        // }
        // if (keys["arrowright"] || keys["d"]) {
        //     room.players[0].x++;
        // }

        if (keys["z"] && keys["control"] && room.inputs.undo) {
            if (!keyboardCommands.undo) {
                room.players[0].Undo();
                keyboardCommands.undo = true;
                if (!enableDevMode)
                    socket.emit("Undo");
            }
        } else {
            keyboardCommands.undo = false;
        }
        //is here because i have to check for the room's inputs and i dont want the room data to be easily accessible
        if (mouse.down && !mouse.wasDown && room.inputs.mouseDown) {
            let m = ConvertS2W(mouse, camera.zoom); //is it better to do it separately or together?
            room.players[0].MouseDown(m.x, m.y);
            if (!enableDevMode)
                socket.emit("MouseDown", m);
        }
        if (!mouse.down && mouse.wasDown && room.inputs.mouseUp) {
            let m = ConvertS2W(mouse, camera.zoom);
            room.players[0].MouseUp(m.x, m.y);
            if (!enableDevMode)
                socket.emit("MouseUp", m);
        }
        if ((mouse.down || !(room.inputs.mouseMovedRequiresDown && room.inputs.mouseDown)) && mouse.mouseMoved && room.inputs.mouseMoved) {
            let m = ConvertS2W(mouse, camera.zoom);
            room.players[0].MouseMove(m.x, m.y);
            if (!enableDevMode)
                socket.emit("MouseMove", m);
        }

        if (mouse.scrolled && room.inputs.scroll) {
            room.players[0].Scroll(mouse.scroll);
            if (!enableDevMode)
                socket.emit("MouseScroll", mouse.scroll);
            mouse.scroll = 0;
            mouse.scrolled = false;
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