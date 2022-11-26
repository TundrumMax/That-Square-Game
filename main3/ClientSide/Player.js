class Player {
    constructor(name, colour, x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.oldPosition = {
            x: 0,
            y: 0
        }
        this.targetPosition = {
            x: 0,
            y: 0
        }
        this.name = name;
        this.colour = colour;
        this.messages = []; //array of messages from the player for displaying above square
        this.keys = 0;
        this.mouse = {
            x: 0,
            y: 0,
            down: false
        }
        this.id = 0;
        this.velocity = { //easier to have the velocity in the main player class than to put it in the subclasses since I can handle the movement in the room code
            x: 0,
            y: 0
        }
    }
    Draw(ctx, scale, camera) {
        ctx.font = "15px Verdana";

        let t = ctx.fillStyle;
        ctx.fillStyle = this.colour;
        //position
        let pP = ConvertW2S({
            x: this.x - 5,
            y: this.y - 5
        }, scale);
        pP.sc = scale * 10;

        ctx.fillRect(pP.x, pP.y, pP.sc, pP.sc);
        ctx.fillStyle = "black";

        //name
        let textPos = ConvertW2S({
            x: this.x,
            y: this.y + 5
        }, scale);
        textPos.y += 15;

        ctx.fillText(this.name, textPos.x, textPos.y);

        //messages
        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].age > 500) {
                this.messages.splice(i, 1);
                i--;
                continue;
            }
            let tP = ConvertW2S({
                x: this.x,
                y: this.y - 20 * (this.messages.length - 1) + 20 * i
            }, scale);
            tP.y -= 15;
            ctx.font = "15px Verdana";

            ctx.globalAlpha = Math.min(1, (500 - this.messages[i].age) / 20);
            ctx.fillText(this.messages[i].message, tP.x, tP.y);
            this.messages[i].age++;
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = t;
    }
    //MouseDown
    //MouseUp
    //MouseMove
    //Scroll
}
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
        this.strokes[this.strokes.length - 1].push([x, y]); //start line
    }
    Undo() {
        this.strokes.pop();
    }
    Scroll(dt) {
        this.lineWidth = Math.max(1, Math.min(this.lineWidth + dt * (this.lineWidth / 5), 100));
    }
}

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
    Draw(ctx, scale) {
        let gun = gunTypes[this.currentGun];
        ctx.lineWidth = gun.girth;
        ctx.lineCap = "butt";
        ctx.beginPath();
        let pP = ConvertW2S({
            x: this.x,
            y: this.y
        }, scale);
        ctx.moveTo(pP.x, pP.y);
        ctx.lineTo(pP.x + Math.sin(this.angle) * gun.barrelLength, pP.y + Math.cos(this.angle) * gun.barrelLength);
        ctx.stroke();


        for (let i = 0; i < this.bullets.length; i++) {
            ctx.lineWidth = this.bullets[i].thickness;
            ctx.beginPath();
            let bulletScreen = {
                a: ConvertW2S({
                    x: this.bullets[i].x,
                    y: this.bullets[i].y
                }, scale),
                b: ConvertW2S({
                    x: this.bullets[i].x + this.bullets[i].direction.x * this.bullets[i].bulletLength,
                    y: this.bullets[i].y + this.bullets[i].direction.y * this.bullets[i].bulletLength
                }, scale)
            }
            ctx.moveTo(bulletScreen.a.x, bulletScreen.a.y);
            ctx.lineTo(bulletScreen.b.x, bulletScreen.b.y);
            ctx.stroke();
        }
        super.Draw(ctx, scale);
    }
    MouseMove(x, y) {
        let pP = ConvertW2S({
            x: this.x,
            y: this.y
        }, camera.zoom);
        let m = ConvertW2S({
            x,
            y
        }, camera.zoom);
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
        this.currentGun %= gunTypes.length;
        if (this.currentGun < 0) this.currentGun += gunTypes.length;
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
        let tBullet = bulletTypes[gunTypes[this.currentGun].bullet];
        //change to account for gun type
        let bullet = new Bullet(origin.x, origin.y, this.angle, tBullet.speed, tBullet.bulletLength, tBullet.thickness, tBullet.damage, this.id);
        this.bullets.push(bullet);


        this.velocity.x -= dir.x * gunTypes[this.currentGun].recoil;
        this.velocity.y -= dir.y * gunTypes[this.currentGun].recoil;

        this.gunAmmo[this.currentGun]--;
        if (this.gunAmmo[this.currentGun] == 0) {
            if (this.ammo[this.currentGun] > 0) {
                this.reloading[this.currentGun] = true;
            }
        }
    }
    Reload() {
        let amount = Math.min(this.ammo[this.currentGun], gunTypes[this.currentGun].ammoCapacity);
        this.gunAmmo[this.currentGun] = amount;
        this.ammo[this.currentGun] -= amount;
    }
}

let Players = {
    main: Player,
    draw: DrawPlayer,
    gun: GunPlayer
}