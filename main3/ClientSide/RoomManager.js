//Mostly classes for settings for the current room

//god dammit javascript
let Rooms = {
    main: Room,
    draw: DrawRoom,
    gun: GunRoom
}

//this hurts
let waitingForRoomType = false;

function ChangeRoom(roomContainer, socket, data) {
    let room;
    let currentRoom = roomContainer.room;
    let you = currentRoom.players[0];
    let t = data.type || destRoomType || "main";
    if (enableDevMode)
        t = destRoomName;
    if (Rooms[t]) {
        if (!enableDevMode)
            socket.emit("JoinRoom", destRoomName, t);


        room = new Rooms[t](destRoomName);
        room.players.push(new Players[t](you.name, you.colour, 0, 0));

        if (data.exists) {
            // for (const p in data.players) {
            //     let pl = data.players[p];
            //     room.players[p] = new Players[t](pl.name, pl.colour, pl.x, pl.y);
            // }
            room.ConstructPlayers(data.players);
        }

        roomContainer.room = room;
        if (!enableDevMode)
            socket.emit("CSetName", roomContainer.room.players[0].name);
        if (!enableDevMode)
            socket.emit("CSetColour", roomContainer.room.players[0].colour);
        camera.target = roomContainer.room.players[0];
        camera.zoom = roomContainer.room.zoom;
        c.style.background = roomContainer.room.backgroundColour;

    } else {
        return `Room type ${destRoomName} doesn't exist!`;
    }

}
/*asks the server if:
A: the room already exists
and
B: the type of the room if it does exist
*/
let destRoomName; //what the player wants to join
let destRoomType; //can be overridden if the room type is different

function RequestRoomChange(socket, dest) { //put in function because why not
    socket.emit("RequestRoom", dest);
}






function ConvertS2W(coords, zoom) { //Screen to world
    return {
        x: camera.x + (coords.x - centre.x) / zoom,
        y: camera.y + (coords.y - centre.y) / zoom
    }
}

function ConvertW2S(coords, zoom) { //World to Screen
    return {
        x: centre.x + (coords.x - camera.x) * zoom,
        y: centre.y + (coords.y - camera.y) * zoom
    }
}