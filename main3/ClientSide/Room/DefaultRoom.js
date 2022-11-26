class Room { //lol classroom
    constructor(name, playerType = "main") { //wtf else do I add
        this.name = name;
        this.backgroundColour = "white";
        this.boundsCage = false;
        this.boundsSize = {
            width: 1280,
            height: 720
        }
        this.zoom = 1; //maybe add some room-specific zoom effects
        this.playerType = playerType;
        this.players = [];
        this.playerSpeed = 1;
        // this.inputs = [false, false, false, false, false]; //mouseDown, mouseUp, mouseMoved, undo, scroll. used to check if a room supports a certain input, gotta figure out how to make this more efficient
        this.inputs = {
            mouseDown: false,
            mouseUp: false,
            mouseMoved: false,
            undo: false,
            scroll: false,
            mouseMovedRequiresDown: false
        };
        this.text = ""; //add some text maybe to the centre of the map to be cool
    }
    Draw(ctx, camera) {
        ctx.textAlign = "center";
        for (const id in this.players) {
            let p = this.players[id];

            p.Draw(ctx, this.zoom, camera);

        }

        ctx.font = "30px Verdana";

        ctx.fillStyle = "black";
        let marginFromEdge = 0.9;
        let textPos = {
            x: centre.x - camera.x * this.zoom,
            y: centre.y + (-70 - camera.y) * this.zoom,
            maxWidth: Math.min(this.boundsSize.width, c.width) * marginFromEdge * this.zoom
        }
        ctx.fillText(this.text, textPos.x, textPos.y, textPos.maxWidth);
        ctx.textAlign = "left";
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        ctx.strokeRect(centre.x + (-camera.x - this.boundsSize.width / 2) * this.zoom, centre.y + (-camera.y - this.boundsSize.height / 2) * this.zoom, this.boundsSize.width * this.zoom, this.boundsSize.height * this.zoom);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.font = "30px Arial";
        ctx.fillText(this.name, 5, 30);
    }
    Update(dt) {
        for (const p in this.players) {
            let player = this.players[p];

            let presses = {
                left: (player.keys & 1),
                right: (player.keys & 2) >> 1,
                up: (player.keys & 4) >> 2,
                down: (player.keys & 8) >> 3
            };
            let v = { //subtract left from right, etc. opposites cancel out so we get a vector that points in the correct direction.
                x: presses.right - presses.left,
                y: presses.down - presses.up
            }
            player.oldPosition.x = player.x;
            player.oldPosition.y = player.y;
            if (!enableDevMode) {
                player.x += (player.targetPosition.x - player.x) / 16;
                player.y += (player.targetPosition.y - player.y) / 16;
            }


            player.x += v.x * dt / 16 * this.playerSpeed; //dt is often 16 so this makes it so that its close to a pixel per frame like originally
            player.y += v.y * dt / 16 * this.playerSpeed;



            let newVel = {
                x: player.velocity.x * Math.pow(0.99, dt),
                y: player.velocity.y * Math.pow(0.99, dt),
            };
            player.x += (newVel.x - player.velocity.x) / Math.log(0.99);
            player.y += (newVel.y - player.velocity.y) / Math.log(0.99);
            // player.x += newVel.x * dt;
            // player.y += newVel.y * dt;
            player.velocity.x = newVel.x;
            player.velocity.y = newVel.y;

            // let temp_accel = {
            //     x: -0.95 * player.velocity.x * dt / 1000,
            //     y: -0.95 * player.velocity.y * dt / 1000
            // }
            // player.velocity.x = player.velocity.x + temp_accel.x * dt / 1000;
            // player.velocity.y = player.velocity.y + temp_accel.y * dt / 1000;

            // player.velocity.x *= 0.99;
            // player.velocity.y *= 0.99;

            if (this.boundsCage) {
                if (player.x - 5 < -this.boundsSize.width / 2) {
                    player.x = -this.boundsSize.width / 2 + 5;
                }
                if (player.y - 5 < -this.boundsSize.height / 2) {
                    player.y = -this.boundsSize.height / 2 + 5;
                }
                if (player.x + 5 > this.boundsSize.width / 2) {
                    player.x = this.boundsSize.width / 2 - 5;
                }
                if (player.y + 5 > this.boundsSize.height / 2) {
                    player.y = this.boundsSize.height / 2 - 5;
                }
            }
        }
        let player = this.players[0];
        if (!this.boundsCage) {
            if ((player.x - 5 > -this.boundsSize.width / 2 &&
                    player.y - 5 > -this.boundsSize.height / 2 &&
                    player.x + 5 < this.boundsSize.width / 2 &&
                    player.y + 5 < this.boundsSize.height / 2)) {
                camera.target = {
                    x: 0,
                    y: 0
                }
            } else {
                camera.target = player;
            }
        }
    }
    NewPlayer(id, name, colour) {
        this.players[id] = new Players[this.playerType](name);
        this.players[id].colour = colour;
        this.players[id].id = id;
    }
    ConstructPlayers(players) {
        for (const p in players) {
            if (p == id) continue;
            let player = players[p];
            this.NewPlayer(p, player.name, player.colour);
            this.players[p].x = player.x;
            this.players[p].y = player.y;
            this.players[p].mouse = player.mouse;
        }
    }
}