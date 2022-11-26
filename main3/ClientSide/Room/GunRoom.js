class GunRoom extends Room {
    constructor(name) {
        super(name, "gun");
        // this.inputs = [true, false, true, false, true];
        this.inputs = {
            mouseDown: true,
            mouseUp: true,
            mouseMoved: true,
            undo: false,
            scroll: true,
            mouseMovedRequiresDown: false
        };
        this.boundsCage = true;

        this.walls = [];
        this.spawnZones = []; //where the players spawn
        this.gameDuration = 0;
        this.ended = false;
        this.winTimer = 0; //how long to show the win screen
        this.leaderboard = []; //list of player IDs in order of points, use player IDs to get player points from player array. player player player.

        this.walls = [];
        for (let k = 0; k < 2; k++) {
            for (let j = 0; j < 10; j++) {
                let p = [];
                let count = j + 3;
                let x = j * 150 - (150 * 9 / 2);
                let y = k * 400 - 200;
                for (let i = 0; i < count; i++) {
                    let v = {
                        x: Math.cos(i * Math.PI / count * 2) * 50,
                        y: Math.sin(i * Math.PI / count * 2) * 50
                    }
                    // let v = {
                    //     x: -Math.cos(i * Math.PI / 50 * 2) * 100,
                    //     y: Math.pow(-Math.cos(i * Math.PI / 50 * 2) * 10, 2) * 1 + Math.floor(i / 25) * 20
                    // }
                    p.push(v);
                }
                this.walls.push(new Wall(p, x, y));
                this.walls[j + (k * 10)].colour = "red";
            }
        }
        this.backgroundColour = "white";



    }
    Draw(ctx, camera) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const id in this.players) {
            let p = this.players[id];
            //draw strokes

            ctx.textAlign = "center";
            p.Draw(ctx, this.zoom, camera);
            ctx.textAlign = "left";

        }
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].Draw(ctx, this.zoom);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.strokeRect(centre.x + (-camera.x - this.boundsSize.width / 2) * this.zoom, centre.y + (-camera.y - this.boundsSize.height / 2) * this.zoom, this.boundsSize.width * this.zoom, this.boundsSize.height * this.zoom);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.font = "30px Arial";
        ctx.fillText(this.name, 5, 30);



        //UI shit
        //ammo count and reload
        let a = UIScale / 30;
        let b = UIScale / 40;
        let offset = a + 15;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(offset, c.height - offset, a, 0, Math.PI * 2 * (this.players[0].reloadCooldown / gunTypes[this.players[0].currentGun].reloadTime))
        ctx.stroke();
        if (!this.players[0].reloading[this.players[0].currentGun]) {
            ctx.beginPath();
            ctx.arc(offset, c.height - offset, b, 0, Math.PI * 2 * (this.players[0].cooldown / gunTypes[this.players[0].currentGun].cooldown))
            ctx.stroke();
        }
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(offset, c.height - offset, a - 6, 0, Math.PI * 2)
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(offset, c.height - offset, b - 5, 0, Math.PI * 2)
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "black";
        ctx.fillText(this.players[0].gunAmmo[this.players[0].currentGun], offset, c.height - offset);
        ctx.textAlign = "left";

        //gun
        ctx.fillText(gunTypes[this.players[0].currentGun].name, offset + a + 15, c.height - offset);
        ctx.textBaseline = 'alphabetic';

    }
    Update(dt) {
        super.Update(dt); //collision between players and walls
        for (const p in this.players) {
            let player = this.players[p];
            let directionVector = {
                x: player.x - player.oldPosition.x,
                y: player.y - player.oldPosition.y
            }
            for (let i = 0; i < this.walls.length; i++) { //loop through walls
                let wall = this.walls[i];

                for (let j = 0; j < wall.points.length; j++) {
                    let p1 = wall.points[j];
                    let p2 = wall.points[(j + 1) % wall.points.length];
                    let delta = {
                        x: p2.x - p1.x,
                        y: p2.y - p1.y
                    }
                    let line1 = {
                        a: {
                            x: p1.x + wall.x,
                            y: p1.y + wall.y
                        },
                        b: {
                            x: p2.x + wall.x,
                            y: p2.y + wall.y
                        }
                    };
                    if ((player.x + 5 > wall.AABB.x + wall.x && //check if player is in the thing
                            player.x - 5 < wall.AABB.x2 + wall.x &&
                            player.y + 5 > wall.AABB.y + wall.y &&
                            player.y - 5 < wall.AABB.y2 + wall.y)) {
                        let line2 = {
                            a: {
                                x: player.oldPosition.x,
                                y: player.oldPosition.y
                            },
                            b: {
                                x: -wall.normals[j].x * 5 + player.x,
                                y: -wall.normals[j].y * 5 + player.y
                            }
                        }
                        let intersection = getIntersection(line1, line2);

                        let intersectPoint = {
                            x: p1.x + delta.x * intersection.lambda + wall.x,
                            y: p1.y + delta.y * intersection.lambda + wall.y
                        };
                        if (intersection.intersected) {
                            //     ctx.fillRect(intersectPoint.x - 10, intersectPoint.y - 10, 20, 20);
                            player.x = intersectPoint.x + wall.normals[j].x * 5;
                            player.y = intersectPoint.y + wall.normals[j].y * 5;
                        }
                    }



                    //and then we do the same thing for all the god damn bullets in the player's list
                    //I want to crie :sob:
                    for (let k = 0; k < player.bullets.length; k++) {
                        let bullet = player.bullets[k];
                        let line2 = {
                            a: {
                                x: bullet.x - bullet.direction.x * bullet.bulletLength,
                                y: bullet.y - bullet.direction.y * bullet.bulletLength
                            },
                            b: {
                                x: -wall.normals[j].x * 5 + bullet.x,
                                y: -wall.normals[j].y * 5 + bullet.y
                            }
                        }
                        let intersection = getIntersection(line1, line2);

                        let intersectPoint = {
                            x: p1.x + delta.x * intersection.lambda + wall.x,
                            y: p1.y + delta.y * intersection.lambda + wall.y
                        };
                        if (intersection.intersected) {
                            //     ctx.fillRect(intersectPoint.x - 10, intersectPoint.y - 10, 20, 20);
                            bullet.x = intersectPoint.x + wall.normals[j].x * 5;
                            bullet.y = intersectPoint.y + wall.normals[j].y * 5;
                            let dp = bullet.direction.x * wall.normals[j].x + bullet.direction.y * wall.normals[j].y;
                            let reflectionRay = {
                                x: bullet.direction.x - 2 * wall.normals[j].x * dp,
                                y: bullet.direction.y - 2 * wall.normals[j].y * dp
                            };
                            bullet.direction.x = reflectionRay.x;
                            bullet.direction.y = reflectionRay.y;
                        }
                    }
                }
            }

            if ((player.shooting || player.cooldown > 0 || player.coolingDown[player.currentGun]) && (!player.reloading[player.currentGun] && player.gunAmmo[player.currentGun] > 0)) {
                if (player.cooldown == 0 && !player.coolingDown[player.currentGun]) {
                    player.Shooty();
                    player.coolingDown[player.currentGun] = true;
                }
                player.cooldown += dt;
            }

            if (player.cooldown >= gunTypes[player.currentGun].cooldown) {
                player.cooldown = 0;
                player.coolingDown[player.currentGun] = false;
            }

            if (player.reloading[player.currentGun]) {
                player.reloadCooldown += dt;
                if (player.reloadCooldown > gunTypes[player.currentGun].reloadTime) {
                    player.reloadCooldown = 0;
                    player.reloading[player.currentGun] = false;
                    player.Reload();
                }
            }

            for (let i = 0; i < player.bullets.length; i++) {
                let b = player.bullets[i];
                b.Update(dt);
            }
        }
    }
    ConstructPlayers(players) {
        for (const p in players) {
            let player = players[p];
            this.NewPlayer(p, player.name, player.colour);
            this.players[p].x = player.x;
            this.players[p].y = player.y;
            this.players[p].targetPosition.x = player.x;
            this.players[p].targetPosition.y = player.y;

            //I waaaaaaaaaant to cry
            this.players[p].currentGun = player.currentGun;
            for (let i = 0; i < player.bullets.length; i++) {
                let bullet = player.bullets[i];
                this.players[p].bullets[i] = new Bullet(bullet.x, bullet.y, bullet.angle, bullet.speed, bullet.bulletLength, bullet.thickness, bullet.damage, bullet.parentID);
            }

            this.players[p].ammo = player.ammo;
            this.players[p].gunAmmo = player.gunAmmo;
            this.players[p].cooldown = player.cooldown;
            this.players[p].coolingDown = player.coolingDown;
            this.players[p].shooting = player.shooting;
            this.players[p].reloadCooldown = player.reloadCooldown;
            this.players[p].reloading = player.reloading;
            this.players[p].alive = player.alive;
            this.players[p].deploymentCooldown = player.deploymentCooldown;
            this.players[p].respawnCooldown = player.respawnCooldown;
            this.players[p].angle = player.angle;
            this.players[p].respawnShieldTime = player.respawnShieldTime;
            this.players[p].points = player.points;
            this.players[p].team = player.team;
            this.players[p].velocity = player.velocity;

            this.players[p].mouse = player.mouse; //isnt really needed? kinda? i guess?
        }
    }
}

class Wall {
    constructor(points, x, y, clockwise = true) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.normals = [];
        this.clockwise = clockwise;
        this.AABB = { //used for basic testing to see if the players are even close to colliding
            x: 0,
            y: 0,
            x2: 0,
            y2: 0
        }
        for (let i = 0; i < points.length; i++) {
            let a = points[i];

            this.AABB.x = Math.min(this.AABB.x, a.x);
            this.AABB.y = Math.min(this.AABB.y, a.y);

            this.AABB.x2 = Math.max(this.AABB.x2, a.x);
            this.AABB.y2 = Math.max(this.AABB.y2, a.y);

            let b = points[(i + 1) % points.length]; //wrap around, connect first and last points
            let vec = {
                x: b.x - a.x,
                y: b.y - a.y
            }
            let normal;
            if (clockwise)
                normal = { //hopefully points out and not in, although it depends on whether or not its clockwise or anti-clockwise
                    x: vec.y,
                    y: -vec.x
                }
            else normal = { //huh?
                x: -vec.y,
                y: vec.x
            }
            let len = Math.sqrt(normal.x ** 2 + normal.y ** 2);
            normal.x /= len;
            normal.y /= len;
            this.normals.push(normal);
        }

        this.colour = "black";
    }
    Draw(ctx, zoom) {
        ctx.beginPath();
        let v1 = ConvertW2S({
            x: this.points[0].x + this.x,
            y: this.points[0].y + this.y
        }, zoom);
        ctx.moveTo(v1.x, v1.y);
        for (let i = 1; i < this.points.length; i++) {
            let v = ConvertW2S({
                x: this.points[i].x + this.x,
                y: this.points[i].y + this.y
            }, zoom);
            ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.fillStyle = this.colour;
        // ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.stroke();

        // ctx.globalAlpha = 1;
        // ctx.beginPath();
        // ctx.strokeStyle = "blue";
        // for (let i = 0; i < this.points.length; i++) {
        //     let a = this.points[i];
        //     let b = this.points[(i + 1) % this.points.length]; //wrap around, connect first and last points

        //     let average = {
        //         x: (a.x + b.x) / 2 + this.x,
        //         y: (a.y + b.y) / 2 + this.y
        //     }
        //     let converted = ConvertW2S(average, zoom);
        //     let converted2 = ConvertW2S({
        //         x: average.x + this.normals[i].x * 30,
        //         y: average.y + this.normals[i].y * 30
        //     }, zoom);

        //     ctx.moveTo(converted.x, converted.y);
        //     ctx.lineTo(converted2.x, converted2.y);

        // }
        // ctx.stroke();
        // ctx.strokeStyle = "red";
        // let AABBBorderToScreen = ConvertW2S({
        //     x: this.AABB.x + this.x,
        //     y: this.AABB.y + this.y
        // }, zoom);
        // ctx.strokeRect(AABBBorderToScreen.x, AABBBorderToScreen.y, (this.AABB.x2 - this.AABB.x) * zoom, (this.AABB.y2 - this.AABB.y) * zoom);
    }
}

class Gun { //it'll sure be funny to edit the numbers in the gun objects, until you realise that physics and game events are mostly run server-side
    constructor(name, bullet) {
        this.name = name;
        this.barrelLength = 20;
        this.girth = 5; //:flushed:
        this.recoil = 10; //how far the gun pushes you back when you shoot
        this.cooldown = 1; //time in seconds for how long it takes for the next bullet to be fired
        this.colour = "black";

        this.reloadTime = 10;
        this.ammoCapacity = 30;
        this.bullet = bullet;
    }
}
//was considering putting this in the gun room, but thought maybe not due to the access of the array inside the player draw function
let gunTypes = []; //maybe two different guns can use the same bullet, but with different recoils, reloads, and firerates

let pistol1 = new Gun("Pistol", 0);
pistol1.barrelLength = 20;
pistol1.girth = 3;
pistol1.recoil = 0.5;
pistol1.cooldown = 400;
pistol1.reloadTime = 3000;

pistol1.ammoCapacity = 20;
gunTypes.push(pistol1);

let sniper1 = new Gun("Sniper Rifle", 1);
sniper1.barrelLength = 50;
sniper1.girth = 3;
sniper1.recoil = 1;
sniper1.cooldown = 1500;
sniper1.reloadTime = 4000;

sniper1.ammoCapacity = 5;
gunTypes.push(sniper1);

let rocket1 = new Gun("Rocket Launcher", 2);
rocket1.barrelLength = 30;
rocket1.girth = 5;
rocket1.recoil = 1;
rocket1.cooldown = 2000;
rocket1.reloadTime = 5000;

rocket1.ammoCapacity = 2;
gunTypes.push(rocket1);

//For templates and the bullets themselves
class Bullet {
    constructor(x, y, angle, speed, bulletLength, thickness, damage, parentID = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.direction = {
            x: Math.sin(angle),
            y: Math.cos(angle)
        }
        this.parentID = parentID;


        this.bulletLength = bulletLength;
        this.thickness = thickness;
        this.damage = damage;
    }
    Update(dt) {
        this.x += this.direction.x * dt * this.speed;
        this.y += this.direction.y * dt * this.speed;

    }
}

class BulletType {
    constructor(bulletLength, thickness, speed, damage) {
        this.bulletLength = bulletLength;
        this.thickness = thickness;
        this.speed = speed;
        this.damage = damage;
    }
}
let bulletTypes = [];

let pistolBullet1 = new BulletType(10, 3, 0.9, 5);

bulletTypes.push(pistolBullet1);

let sniperBullet1 = new BulletType(10, 2, 2, 15);

bulletTypes.push(sniperBullet1);

let rocketRocket1 = new BulletType(10, 4, 1.5, 40);

bulletTypes.push(rocketRocket1);

//stolen from stack overflow, an answer by Dan Fox, edited to work with vector objects
function getIntersection(line1, line2) {
    var det, gamma, lambda;


    det = (line1.b.x - line1.a.x) * (line2.b.y - line2.a.y) - (line2.b.x - line2.a.x) * (line1.b.y - line1.a.y);
    if (det === 0) {
        return false;
    } else {
        lambda = ((line2.b.y - line2.a.y) * (line2.b.x - line1.a.x) + (line2.a.x - line2.b.x) * (line2.b.y - line1.a.y)) / det;
        gamma = ((line1.a.y - line1.b.y) * (line2.b.x - line1.a.x) + (line1.b.x - line1.a.x) * (line2.b.y - line1.a.y)) / det;
        // return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        return {
            lambda,
            gamma,
            intersected: (-0.05 < lambda && lambda < 1.05) && (-0.05 < gamma && gamma < 1.05)
        }
    }
}