let c;
let centre;
let ctx;

let camera;

let t = 0;

let UIScale = 0;

function Main() {



    let socket;
    if (!enableDevMode)
        socket = io();





    c = document.createElement("canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    centre = {
        x: c.width / 2,
        y: c.height / 2
    }
    UIScale = Math.min(c.width, c.height);
    document.body.prepend(c);
    ctx = c.getContext("2d");
    let roomContainer = { //literally only so I can change the room without dereferencing it
        room: new Rooms["main"]()
    }
    roomContainer.room.text = "Welcome! Press enter to chat, and type /goto main to chat with others!";
    let playerColour = "hsl(" + Math.random() * 360 + ",100%,40%)";

    roomContainer.room.players.push(new Player("You", playerColour, 0, 0));
    chatInput.style.boxShadow = `0 0 5px 5px ${roomContainer.room.players[0].colour}`;
    SetupEventListeners(roomContainer, socket);

    InitSocketEvents(socket, roomContainer);


    camera = {
        x: 0,
        y: 0,
        target: roomContainer.room.players[0],
        easing: 5, //how smooth it gotta be,
        zoom: roomContainer.room.zoom,
        old: [{
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: 0
            }
        ]
    }

    let time = {
        nt: 0,
        ot: 0,
        dt: 0
    }

    function Loop() {
        time.ot = time.nt;
        time.nt = performance.now();
        time.dt = time.nt - time.ot;
        t++;
        camera.old[1].x = camera.old[0].x; //tail the position of the camera to determine changes in camera direction, used for adding additional paint lines when the player is moving independantly of their mouse movement
        camera.old[1].y = camera.old[0].y;
        camera.old[0].x = camera.x;
        camera.old[0].y = camera.y;

        camera.x += (camera.target.x - camera.x) / camera.easing;
        camera.y += (camera.target.y - camera.y) / camera.easing;

        ctx.clearRect(0, 0, c.width, c.height);

        Input(keys, mouse, roomContainer, socket, camera);
        roomContainer.room.Update(time.dt, socket);
        roomContainer.room.Draw(ctx, camera);
        mouse.wasDown = mouse.down;
        mouse.mouseMoved = false;

        requestAnimationFrame(Loop);
    }
    if (!enableDevMode)
        id = socket.id;
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
    UIScale = Math.min(c.width, c.height);
}