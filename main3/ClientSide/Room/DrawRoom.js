class DrawRoom extends Room { //????????
    constructor(name) {
        super(name, "draw");
        // this.inputs = [true, false, true, true, true];
        this.inputs = {
            mouseDown: true,
            mouseUp: false,
            mouseMoved: true,
            undo: true,
            scroll: true,
            mouseMovedRequiresDown: true
        };
        this.zoom = 1;
    }
    Draw(ctx, camera) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const id in this.players) {
            let p = this.players[id];
            //draw strokes

            for (let i = 0; i < p.strokes.length; i++) {
                ctx.beginPath();
                let s = p.strokes[i];
                for (let j = 0; j < s.length; j++) {
                    let pp;
                    if (j) {
                        pp = ConvertW2S({
                            x: s[j][0],
                            y: s[j][1]
                        }, this.zoom);
                    }
                    switch (j) {
                        case 0:
                            ctx.lineWidth = s[j][0] * this.zoom;
                            ctx.strokeStyle = s[j][1];
                            break;
                        case 1:
                            ctx.moveTo(pp.x, pp.y);
                            break;
                        default:
                            ctx.lineTo(pp.x, pp.y);
                    }
                }
                ctx.stroke();
            }
            // ctx.closePath();

            ctx.textAlign = "center";
            p.Draw(ctx, this.zoom, camera);
            ctx.textAlign = "left";

        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.strokeRect(centre.x + (-camera.x - this.boundsSize.width / 2) * this.zoom, centre.y + (-camera.y - this.boundsSize.height / 2) * this.zoom, this.boundsSize.width * this.zoom, this.boundsSize.height * this.zoom);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.font = "30px Arial";
        ctx.fillText(this.name, 5, 30);
        ctx.fillStyle = this.players[0].drawColour;
        ctx.beginPath();
        let brush = {
            x: this.players[0].lineWidth / 2 + 5,
            y: this.players[0].lineWidth / 2 + 40
        }
        ctx.arc(brush.x, brush.y, this.players[0].lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    Update(dt, socket) {
        super.Update(dt);
        if (!chatOpen) { //handle drawing while the camera is moving
            let v1 = {
                x: camera.x - camera.old[0].x,
                y: camera.y - camera.old[0].y
            }
            let d1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            v1.d = d1;
            let v2 = {
                x: camera.old[0].x - camera.old[1].x,
                y: camera.old[0].y - camera.old[1].y
            }
            let d2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            v2.d = d2;
            // let diff = ((v1.x || 1) / (v2.x || 1)) - ((v1.y || 1) / (v2.y || 1));
            let dp = (v1.x / v1.d * v2.x / v2.d + v1.y / v1.d * v2.y / v2.d);
            // ctx.fillText(dp, 0, 30);
            if ((dp < 0.9999999 || !dp) && mouse.down && !mouse.mouseMoved) { //hopefully this properly detects if the velocity angle is not the same
                let m = ConvertS2W({
                    x: mouse.x - v1.x,
                    y: mouse.y - v1.y
                }, camera.zoom)
                this.players[0].MouseMove(m.x, m.y); //trigger mouse move
                // ctx.fillText("BOOP", 0, 30);
                if (!enableDevMode)
                    socket.emit("MouseMove", m);
            }
        }


    }
    ConstructPlayers(players) {
        for (const p in players) {
            let player = players[p];
            this.NewPlayer(p, player.name, player.colour);
            this.players[p].x = player.x;
            this.players[p].y = player.y;
            this.players[p].strokes = player.strokes;
            this.players[p].lineWidth = player.lineWidth;
            this.players[p].drawColour = player.drawColour;
            this.players[p].mouse = player.mouse;
        }
    }
}