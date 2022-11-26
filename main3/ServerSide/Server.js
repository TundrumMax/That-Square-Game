const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const htmlPath = path.join(__dirname, "../ClientSide")

const PlayerTypes = require('./Player.js'); //player classes
const RoomTypes = require('./Rooms.js');
const {
    performance
} = require('perf_hooks');

let rooms = []; //table of rooms with players that are currently connected
//init rooms because they gone be there anyway
rooms.draw = new RoomTypes.draw("draw", false);
rooms.gun = new RoomTypes.gun("gun", false);


app.get("/", (req, res) => {
    res.sendFile(htmlPath + "/index.html");
})

app.use(express.static(htmlPath));

http.listen(process.env.PORT || 80, () => {
    console.log("Everything is working fine!");
});

function getCurrentDateFormmated() {
    let date = new Date(); //do i really have to do this every single time???
    return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}
//events
io.on("connection", (socket) => {
    let cRoom; //store the room name in this scope to make things easier

    //lmao this is depressing

    console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "connected!");
    cRoom = socket.id + "_Room";
    rooms[cRoom] = new RoomTypes.main(socket.id, true); //create a new temporary room for the player to be in that uses the player's id for uniqueness and stuff
    rooms[cRoom].players[socket.id] = new PlayerTypes[rooms[cRoom].playerType]("Private", "black", cRoom);
    socket.join(cRoom);

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });


    socket.on("JoinRoom", (room, type = "main") => {
        socket.leave(cRoom);
        //remove player from room
        socket.to(cRoom).emit("playerLeft", (socket.id));
        delete rooms[cRoom].players[socket.id]; //i really hate this line

        if (!Object.keys(rooms[cRoom].players).length && rooms[cRoom].tempRoom) { //if there are literally no players
            delete rooms[cRoom]; //delete the room entirely
        }


        if (!rooms[room]) { //if the room doesnt exist

            rooms[room] = new RoomTypes[type || "main"](room, true); //create a new room for the player
        }

        rooms[room].players[socket.id] = new PlayerTypes[rooms[room].playerType]("Guest", "black", room);


        socket.join(room);
        cRoom = room;
        socket.to(room).emit("playerJoined", socket.id, rooms[room].players[socket.id].name, rooms[room].players[socket.id].colour);

        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "joined", room + "!");
    });

    socket.on("RequestRoom", (name) => { //we can definitely move this into the room functions so we can keep the shit
        let data = {};
        if (rooms[name]) {
            data.exists = true;
            data.type = rooms[name].playerType;
            // data.players = Object.assign({}, rooms[name].players);
            data.players = {};
            for (const p in rooms[name].players) { //this shit gets the player data
                let player = rooms[name].players[p];
                data.players[p] = player; //yea this just works
                //i dont think moving the entire array into the other works so im doing it this way
            }
            data.zoom = rooms[name].zoom; //if only there was a way to list off what attributes we want to copy in an array or something
            data.bounds = {
                boundSize: rooms[name].boundSize,
                caged: rooms[name].boundsCage
            };
            data.text = rooms[name].text;
            data.bg = rooms[name].bg;
        } else {
            data.exists = false;
        }
        socket.emit("RequestRoom", JSON.stringify(data));
    })


    socket.on("disconnect", () => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "left :(");
        socket.to(cRoom).emit("playerLeft", socket.id);

        delete rooms[cRoom].players[socket.id];

        if (!Object.keys(rooms[cRoom].players).length && rooms[cRoom].tempRoom) { //if there are literally no players
            delete rooms[cRoom]; //delete the room entirely
        }
    })

    socket.on("message", (message) => {
        socket.to(cRoom).emit("message", socket.id, message);

        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m` + ":", message);
    });



    /*

    COMMANDS

    */

    socket.on("CSetColour", (colour) => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "set their", `\x1b[1m${"colour"}\x1b[0m`, "to", colour);
        rooms[cRoom].players[socket.id].colour = colour;
        socket.to(cRoom).emit("CSetColour", socket.id, colour);
    });

    socket.on("CSetName", (name) => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "set their", `\x1b[1m${"name"}\x1b[0m`, "to", name);
        rooms[cRoom].players[socket.id].name = name;
        socket.to(cRoom).emit("CSetName", socket.id, name);
    });

    socket.on("CSetPaint", (paintColour) => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "set their", `\x1b[1m${"paint colour"}\x1b[0m`, "to", paintColour);
        rooms[cRoom].players[socket.id].drawColour = paintColour;
        socket.to(cRoom).emit("CSetPaint", socket.id, paintColour);
    })
    /*

    PLAYER INTERACTION AND INPUT

    */


    socket.on("UpdateInput", (keys, add) => {
        if (add) {
            rooms[cRoom].players[socket.id].keys |= keys;
        } else {
            rooms[cRoom].players[socket.id].keys &= ~keys;
        }
        socket.to(cRoom).emit("UpdateInput", socket.id, rooms[cRoom].players[socket.id].keys);
    });

    socket.on("MouseDown", (mouse) => {
        rooms[cRoom].players[socket.id].mouse.x = mouse.x;
        rooms[cRoom].players[socket.id].mouse.y = mouse.y;
        rooms[cRoom].players[socket.id].mouse.down = true;
        socket.to(cRoom).emit("MouseDown", socket.id, {
            x: mouse.x,
            y: mouse.y
        });
        if (rooms[cRoom].inputs.mouseDown) {
            rooms[cRoom].players[socket.id].MouseDown(mouse.x, mouse.y);
        }
    });
    socket.on("MouseUp", (mouse) => {
        rooms[cRoom].players[socket.id].mouse.x = mouse.x;
        rooms[cRoom].players[socket.id].mouse.y = mouse.y;
        rooms[cRoom].players[socket.id].mouse.down = false;
        socket.to(cRoom).emit("MouseUp", socket.id, {
            x: mouse.x,
            y: mouse.y
        });
        if (rooms[cRoom].inputs.mouseUp) {
            rooms[cRoom].players[socket.id].MouseUp(mouse.x, mouse.y);
        }
    });
    socket.on("MouseMove", (mouse) => {
        rooms[cRoom].players[socket.id].mouse.x = mouse.x;
        rooms[cRoom].players[socket.id].mouse.y = mouse.y;
        socket.to(cRoom).emit("MouseMove", socket.id, {
            x: mouse.x,
            y: mouse.y
        });
        if (rooms[cRoom].inputs.mouseMoved) {
            rooms[cRoom].players[socket.id].MouseMove(mouse.x, mouse.y);
        }
    });
    socket.on("MouseScroll", (mouseScroll) => {
        socket.to(cRoom).emit("MouseScroll", socket.id, mouseScroll);
        if (rooms[cRoom].inputs.scroll) {
            rooms[cRoom].players[socket.id].Scroll(mouseScroll);
        }
    });
    socket.on("Undo", () => {
        socket.to(cRoom).emit("Undo", socket.id);
        rooms[cRoom].players[socket.id].Undo();
    })
});
let time = {
    newTime: 0,
    oldTime: 0,
    deltaTime: 0
};
//GAME LOOP FOR MAKING SURE SHIT IS SYNCED UP LMAO
let GameLoop = setInterval(() => {
    time.oldTime = time.newTime;
    time.newTime = performance.now();
    time.deltaTime = time.newTime - time.oldTime;
    for (const r in rooms) {
        let room = rooms[r];
        room.Update(time.deltaTime, io, r);
    }
}, 8) //between 60 fps and 30 fps, bit cringe but will fix eventually
//APPARENTLY THE FPS FLUCTUATION IS SORTED???? DOESNT MATTER BECAUSE DELTATIME :D