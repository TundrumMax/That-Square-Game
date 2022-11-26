let id;

let enableDevMode = false;

function InitSocketEvents(socket, roomContainer) {
    if (enableDevMode) return;
    /*
    Basic Interaction
    */

    socket.on("message", (id, message) => {
        chatBox.classList.value = "";
        AddMessage(id, message, roomContainer.room);
        void chatBox.offsetWidth;
        chatBox.classList.value = "hideButLonger";
    });

    socket.on("playerJoined", (id, name, colour) => {
        roomContainer.room.NewPlayer(id, name, colour);
    });

    socket.on("playerLeft", (id) => {
        delete roomContainer.room.players[id];
    });

    socket.on("RequestRoom", data => { //does it exist and if so, what is the type?
        ChangeRoom(roomContainer, socket, JSON.parse(data));
    });

    /*
    Commands
    */

    socket.on("CSetColour", (id, colour) => {
        roomContainer.room.players[id].colour = colour;
    });

    socket.on("CSetName", (id, name) => {
        roomContainer.room.players[id].name = name;
    });

    socket.on("CSetPaint", (id, paint) => {
        roomContainer.room.players[id].drawColour = paint;
    });

    /*
    Server Reconcillation
    */

    socket.on("UpdatePlayers", list => {
        for (let i = 0; i < list.length; i++) {
            let tempid = list[i].id;
            if (!id) {
                id = socket.id;
                if (!roomContainer.room.name) {
                    roomContainer.room.name = socket.id;
                }
            }
            if (tempid == id) {
                tempid = 0;
            }
            let diff = {
                x: roomContainer.room.players[tempid].x - list[i].position.x,
                y: roomContainer.room.players[tempid].y - list[i].position.y
            }
            // if (diff.x + diff.y > 5) {
            // roomContainer.room.players[tempid].x -= diff.x / 6;
            // roomContainer.room.players[tempid].y -= diff.y / 6;

            roomContainer.room.players[tempid].targetPosition.x = list[i].position.x
            roomContainer.room.players[tempid].targetPosition.y = list[i].position.y
            // }
            roomContainer.room.players[tempid].velocity.x += (list[i].velocity.x - roomContainer.room.players[tempid].velocity.x) / 6;
            roomContainer.room.players[tempid].velocity.y += (list[i].velocity.y - roomContainer.room.players[tempid].velocity.y) / 6;
        }
    });

    /*
    Player-Server Input
    */

    socket.on("UpdateInput", (id, input) => {
        roomContainer.room.players[id].keys = input;
    });

    socket.on("MouseDown", (id, m) => {
        roomContainer.room.players[id].mouse.down = true;
        roomContainer.room.players[id].mouse.x = m.x;
        roomContainer.room.players[id].mouse.y = m.y;
        if (roomContainer.room.inputs.mouseDown)
            roomContainer.room.players[id].MouseDown(m.x, m.y);
    });
    socket.on("MouseUp", (id, m) => {
        roomContainer.room.players[id].mouse.down = false;
        roomContainer.room.players[id].mouse.x = m.x;
        roomContainer.room.players[id].mouse.y = m.y;
        if (roomContainer.room.inputs.mouseUp)
            roomContainer.room.players[id].MouseUp(m.x, m.y);
    });
    socket.on("MouseMove", (id, m) => {
        roomContainer.room.players[id].mouse.x = m.x;
        roomContainer.room.players[id].mouse.y = m.y;
        if ((mouse.down || !(roomContainer.room.inputs.mouseMovedRequiresDown && roomContainer.room.inputs.mouseDown)) && roomContainer.room.inputs.mouseMoved)
            roomContainer.room.players[id].MouseMove(m.x, m.y);
    });
    socket.on("MouseScroll", (id, dt) => {
        if (roomContainer.room.inputs.scroll) {
            roomContainer.room.players[id].Scroll(dt);
            console.log(dt);
        }
    });
    socket.on("Undo", (id) => {
        roomContainer.room.players[id].Undo();
    });
    socket.on("ServerDebug", (text) => {
        chatBox.classList.value = "";
        AddMessage(0, text, roomContainer.room);
        void chatBox.offsetWidth;
        chatBox.classList.value = "hideButLonger";
    })
}