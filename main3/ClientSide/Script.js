let c;
let centre;

function Main() {

    let socket = io();
    let id = socket.id;

    c = document.createElement("canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    centre = {
        x: c.width / 2,
        y: c.height / 2
    }
    document.body.prepend(c);
    let ctx = c.getContext("2d");
    let roomContainer = { //literally only so I can change the room without dereferencing it
        room: new Room("Lobby")
    }

    roomContainer.room.text = "Welcome! Press enter to chat, and type /goto Draw to join Draw!";
    let playerColour = "hsl(" + Math.random() * 360 + ",100%,40%)";

    roomContainer.room.players.push(new Player("You", playerColour, 0, 0));
    chatInput.style.boxShadow = `0 0 5px 5px ${roomContainer.room.players[0].colour}`;
    SetupEventListeners(roomContainer.room);
    InitSocketEvents(socket);

    function Loop() {
        ctx.clearRect(0, 0, c.width, c.height);

        Input(keys, mouse, roomContainer, socket);

        roomContainer.room.Draw(ctx, 1);

        mouse.wasDown = mouse.down;
        mouse.mouseMoved = false;

        requestAnimationFrame(Loop);
    }
    Loop();
}
window.onload = () =>
    Main();

window.onresize = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    centre = {
        x: c.width / 2,
        y: c.height / 2
    }
}