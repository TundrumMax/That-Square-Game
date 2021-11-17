//Mostly classes for settings for the current room
class Room { //lol classroom
    constructor(name, playerType = "Default") { //wtf else do I add
        this.name = name;
        this.backgroundColour = "white";
        this.boundsCage = true;
        this.boundSize = {
            width: 800,
            height: 600
        }
        this.zoom = 1; //maybe add some room-specific zoom effects
        this.playerType = playerType;
        this.players = [];
        this.inputs = [false, false, false, false]; //mouseDown, mouseUp, mouseMoved, undo. used to check if a room supports a certain input, gotta figure out how to make this more efficient
        this.text = ""; //add some text maybe to the centre of the map to be cool
    }
    Draw(ctx, scale) {
        for (const p of this.players) {
            p.Draw(ctx, scale);
        }
        ctx.font = "50px Verdana";
        let tWidth = ctx.measureText(this.text).width;
        ctx.fillStyle = "black";
        ctx.fillText(this.text, centre.x - tWidth / 2, centre.y - 70);
    }
}
class DrawRoom extends Room { //????????
    constructor(name) {
        super(name, "draw");
        this.inputs = [true, false, true, true];
    }
    Draw(ctx, scale) {
        for (const p of this.players) {
            //draw strokes
            ctx.beginPath();
            for (let i = 0; i < p.strokes.length; i++) {
                let s = p.strokes[i];
                for (let j = 0; j < s.length; j++) {
                    switch (j) {
                        case 0:
                            ctx.lineWidth = s[j][0];
                            ctx.strokeStyle = s[j][1];
                            break;
                        case 1:
                            ctx.moveTo(s[j][0] + centre.x, s[j][1] + centre.y);
                            break;
                        default:
                            ctx.lineTo(s[j][0] + centre.x, s[j][1] + centre.y);
                    }
                }
            }
            // ctx.closePath();
            ctx.stroke();

            p.Draw(ctx, scale);
        }
    }
}
class GunRoom extends Room {
    constructor(name) {
        super(name, "gun");
        this.inputs = [true, false, true, false];
        this.bullets = [];
        this.walls = [];
        this.gameDuration = 0;
        this.ended = false;
        this.winTimer = 0; //how long to show the win screen
        this.leaderboard = []; //list of player IDs in order of points, use player IDs to get player points from player array. player player player.
    }
}

//this hurts
function ChangeRoom(roomContainer, destinationRoom) {
    let room;
    let currentRoom = roomContainer.room;
    let you = currentRoom.players[0];
    switch (destinationRoom) {
        case "main":
            room = new Room(currentRoom.name);
            room.text = "Welcome! Press enter to chat, and type /goto Draw to join Draw!";
            room.players.push(new Player(you.name, you.colour, 0, 0));
            roomContainer.room = room;
            break;
        case "draw":
            room = new DrawRoom(currentRoom.name);
            room.players.push(new DrawPlayer(you.name, you.colour, 0, 0));
            roomContainer.room = room;
            break;
        case "gun":
            room = new GunRoom(currentRoom.name);
            room.players.push(new GunPlayer(you.name, you.colour, 0, 0));
            roomContainer.room = room;
            break;
        default:
            return `Room ${destinationRoom} doesn't exist!`;
    }
}