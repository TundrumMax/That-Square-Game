class Player {
    constructor(name, colour, x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.colour = colour;
        this.messages = []; //array of messages from the player


    }
    Draw(ctx, scale) {
        ctx.font = "15px Verdana";
        if (!this.nameWidth) {
            this.nameWidth = ctx.measureText(this.name).width / 2;
        }
        let t = ctx.fillStyle;
        ctx.fillStyle = this.colour;
        //position - halfSize + halfCanvasSize
        ctx.fillRect(this.x - scale * 5 + centre.x, this.y - scale * 5 + centre.y, scale * 10, scale * 10);
        ctx.fillStyle = t;


        ctx.fillText(this.name, this.x - this.nameWidth + centre.x, this.y + 20 + centre.y);
    }
    //MouseDown
    //MouseUp
    //MouseMove
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

        this.strokes[this.strokes.length - 1].push([x - centre.x, y - centre.y]); //start line
    }
    MouseMove(x, y) {
        this.strokes[this.strokes.length - 1].push([x - centre.x, y - centre.y]);
    }
    Undo() {
        this.strokes.pop();
    }
}
class GunPlayer extends Player {
    constructor(name, colour, x = 0, y = 0) {
        super(name, colour, x, y);
        this.currentGun = 0;
        this.cooldown = 0;
        this.alive = true;
        this.deploymentCooldown = 0;
        this.respawnCooldown = 0;
        this.respawnShieldTime = 0; //used for a few seconds of shielding against being shot at other players so that you don't get immediately spawn killed
        this.points = 0;

        this.spectating = false; //prevent player from moving also, so that you dont get weird stuff happening idk
    }
}