const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const htmlPath = path.join(__dirname, "../ClientSide")

require('./Player.js')(); //player classes


let players = [];

app.get("/", (req, res) => {
    res.sendFile(htmlPath + "/index.html");
})

app.use(express.static(htmlPath));

http.listen(process.env.PORT || 80, () => {
    console.log("Everything is working fine!");
});

function getCurrentDateFormmated() {
    let date = new Date(); //do i really have to do this every single time
    return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}
//events
io.on("connection", (socket) => {

    socket.join("mainRoom");
    //lmao this is depressing
    // let formattedDate = (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()); //REUSE THIS
    console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "joined!");

    socket.on("disconnect", () => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m`, "left :(");
    })


    socket.on("message", (message) => {
        console.log('\x1b[33m%s\x1b[0m', getCurrentDateFormmated(), `\x1b[34m${socket.id}\x1b[0m` + ":", message);
        // let currentRoom = io.sockets.manager.roomClients[socket.id];
        let rooms = Array.from(io.sockets.adapter.sids.get(socket.id));
        // console.log(rooms);
        socket.to(rooms[1]).emit("message", socket.id, message);
        // console.log(message);
    });
});

let GameLoop = setInterval(() => {

}, 16) //between 60 fps and 30 fps, bit cringe but will fix eventually