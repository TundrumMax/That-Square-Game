const Room = require('./Rooms.js');

class Player {
    constructor(name, colour, room, x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.oldPosition = {
            x: 0,
            y: 0
        }
        this.name = name;
        this.colour = colour;
        this.messages = []; //array of messages from the player
        this.room = room;
        this.keys = 0; //use a single int for storing keys, since its just on/off
        this.mouse = { //player's mouse in world coordinates
            x: 0,
            y: 0,
            down: false
        }
        this.velocity = { //easier to have the velocity in the main player class than to put it in the subclasses since I can handle the movement in the room code
            x: 0,
            y: 0
        }
    }
    //MouseDown
    //MouseUp
    //MouseMove
}
exports.main = Player;
class DrawPlayer extends Player {
    constructor(name, colour, x = 0, y = 0) {
        super(name, colour, x, y);
        this.drawColour = "black";
        this.lineWidth = 1;
        this.strokes = []; //each stroke contains an array of lines
        //first element of each stroke contains data on thickness and colour
    }
    MouseDown(x, y) {
        this.strokes.push([
            [this.lineWidth, this.drawColour]
        ]);

        this.strokes[this.strokes.length - 1].push([x, y]); //start line
    }
    MouseMove(x, y) {
        this.strokes[this.strokes.length - 1].push([x, y]);
    }
    Undo() {
        this.strokes.pop();
    }
    Scroll(dt) {
        this.lineWidth = Math.max(1, Math.min(this.lineWidth + dt * (this.lineWidth / 5), 100));
    }
}
exports.draw = DrawPlayer;
class GunPlayer extends Player {
    constructor(name, colour, x = 0, y = 0) {
        super(name, colour, x, y);

        this.currentGun = 0;
        this.bullets = [];

        this.ammo = [120, 50, 50]; //total ammo
        this.gunAmmo = [20, 5, 2]; //ammo held by guns

        this.cooldown = 0;
        this.coolingDown = [false, false, false] //im getting annoyed by all these arrays
        this.shooting = false;

        this.reloadCooldown = 0;
        this.reloading = [false, false, false];






        this.alive = true;
        this.deploymentCooldown = 0; //shield deployment
        this.respawnCooldown = 0;
        this.angle = 0;
        this.respawnShieldTime = 0; //used for a few seconds of shielding against being shot at other players so that you don't get immediately spawn killed
        this.points = 0;


        this.spectating = false; //prevent player from moving also, so that you dont get weird stuff happening idk
        this.team = 0; //0 neutral, 1 red, 2 blue, etc. whatever



        this.velocity = { //used for recoil
            x: 0,
            y: 0
        }


    }
    MouseMove(x, y) {
        let pP = {
            x: this.x,
            y: this.y
        };
        let m = {
            x,
            y
        };
        m.x -= pP.x;
        m.y -= pP.y;
        let a = Math.atan2(m.x, m.y);
        this.angle = a;
    }
    MouseDown(x, y) {
        this.shooting = true;
    }
    MouseUp(x, y) {
        this.shooting = false;
    }
    Scroll(delta) {
        this.currentGun += Math.sign(delta);
        this.currentGun %= Room.gunTypes.length;
        if (this.currentGun < 0) this.currentGun += Room.gunTypes.length;
        this.reloadCooldown = 0;
        this.cooldown = 0;
    }
    Shooty() {
        let dir = {
            x: Math.sin(this.angle),
            y: Math.cos(this.angle)
        }
        let origin = {
            x: this.x,
            y: this.y
        }
        let tBullet = Room.bulletTypes[Room.gunTypes[this.currentGun].bullet];
        //change to account for gun type
        let bullet = new Room.bullet(origin.x, origin.y, this.angle, tBullet.speed, tBullet.bulletLength, tBullet.thickness, tBullet.damage, this.id);
        this.bullets.push(bullet);


        this.velocity.x -= dir.x * Room.gunTypes[this.currentGun].recoil;
        this.velocity.y -= dir.y * Room.gunTypes[this.currentGun].recoil;

        this.gunAmmo[this.currentGun]--;
        if (this.gunAmmo[this.currentGun] == 0) {
            if (this.ammo[this.currentGun] > 0) {
                this.reloading[this.currentGun] = true;
            }
        }
    }
    Reload() {
        let amount = Math.min(this.ammo[this.currentGun], Room.gunTypes[this.currentGun].ammoCapacity);
        this.gunAmmo[this.currentGun] = amount;
        this.ammo[this.currentGun] -= amount;
    }
}
exports.gun = GunPlayer;