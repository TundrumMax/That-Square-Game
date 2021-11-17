module.exports = function () {
    class Player {
        constructor(name, colour, x = 0, y = 0) {
            this.x = x;
            this.y = y;
            this.name = name;
            this.colour = colour;
        }
        //MouseDown
        //MouseUp
        //MouseMove
    }
    class DrawPlayer extends Player {
        constructor(name, colour, x = 0, y = 0) {
            super(name, colour, x, y);
            // this.drawColour = "black"; //dont think i need these
            // this.lineWidth = 1;
            this.strokes = []; //each stroke contains an array of lines
            //first element of each stroke contains data on thickness and colour
        }
        MouseDown(x, y) { //not really sure if I need these
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
}