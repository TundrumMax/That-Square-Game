function readJSONFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.responseType = 'json';
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.response);
        }
    }
    rawFile.send(null);
}


let Walls = [];


readJSONFile("../map1.json", function (text) {
    let W = JSON.parse(text);
    for (let i = 0; i < W.length; i++) {
        Walls.push(new Wall(W[i].points, W[i].x, W[i].y, W[i].normals, W[i].AABB, W[i].clockwise, W[i].colour));
    }
});

class Wall {
    constructor(points, x, y, normals, AABB, clockwise, colour) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.normals = normals;
        this.AABB = AABB;
        this.clockwise = clockwise;
        this.colour = colour;
    }
    Draw(ctx, zoom) {
        ctx.strokeStyle = "black";
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
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        for (let i = 0; i < this.points.length; i++) {
            let a = this.points[i];
            let b = this.points[(i + 1) % this.points.length]; //wrap around, connect first and last points

            let average = {
                x: (a.x + b.x) / 2 + this.x,
                y: (a.y + b.y) / 2 + this.y
            }
            let converted = ConvertW2S(average, zoom);
            let converted2 = ConvertW2S({
                x: average.x + this.normals[i].x * 30,
                y: average.y + this.normals[i].y * 30
            }, zoom);

            ctx.moveTo(converted.x, converted.y);
            ctx.lineTo(converted2.x, converted2.y);

        }
        ctx.stroke();
        ctx.strokeStyle = "red";
        let AABBBorderToScreen = ConvertW2S({
            x: this.AABB.x + this.x,
            y: this.AABB.y + this.y
        }, zoom);
        ctx.strokeRect(AABBBorderToScreen.x, AABBBorderToScreen.y, (this.AABB.x2 - this.AABB.x) * zoom, (this.AABB.y2 - this.AABB.y) * zoom);
    }
}

let camera = {
    x: 0,
    y: 0,
    zoom: 1
}
let centre = {
    x: 0,
    y: 0
};
let boundsSize = {
    width: 1280,
    height: 720
}

let currentControl = 0;
let controlCursor = ["move", "default", "url(1F58A.cur) 0 10, default", "url(270F.cur), crosshair"];
window.onload = () => {
    let panelToggle = document.getElementById("toggle");
    let UISection = document.getElementById("UISection");
    panelToggle.addEventListener("click", function () {
        this.classList.toggle("open");
        UISection.classList.toggle("lowered");

    });

    let toolButton = document.getElementsByClassName("toolButton");
    for (let i = 0; i < toolButton.length; i++) {
        toolButton[i].addEventListener("click", function () {
            if (toolButton[currentControl] == this) return;
            toolButton[currentControl].classList.toggle("selected");
            this.classList.toggle("selected");
            currentControl = i;
            c.style.cursor = controlCursor[i];
        })
    }



    let c = document.createElement("canvas");
    let ctx = c.getContext("2d");
    document.body.prepend(c);

    c.width = window.innerWidth;
    c.height = window.innerHeight;
    centre.x = c.width / 2;
    centre.y = c.height / 2;
    window.onresize = () => {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        centre.x = c.width / 2;
        centre.y = c.height / 2;
    }
    let mouse = {
        x: 0,
        y: 0,
        isDown: false
    }
    c.onmousedown = () => {
        mouse.isDown = true;
    }
    c.onmouseup = () => {
        mouse.isDown = false;
    }
    c.onmousemove = (e) => {
        let convertedCoords = ConvertS2W({
            x: e.clientX,
            y: e.clientY
        }, camera.zoom)
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }




    function Loop() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.lineWidth = 3;
        if (Walls.length)
            for (let i = 0; i < Walls.length; i++)
                Walls[i].Draw(ctx, camera.zoom);

        ctx.fillStyle = "black";
        //position
        let pP = ConvertW2S({
            x: -5,
            y: -5
        }, camera.zoom);
        pP.sc = 10 * camera.zoom;

        ctx.fillRect(pP.x, pP.y, pP.sc, pP.sc);


        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        ctx.strokeRect(centre.x + (-camera.x - boundsSize.width / 2) * camera.zoom, centre.y + (-camera.y - boundsSize.height / 2) * camera.zoom, boundsSize.width * camera.zoom, boundsSize.height * camera.zoom);
        ctx.fillRect(mouse.x - 5, mouse.y - 5, 10, 10);
        requestAnimationFrame(Loop);
    }
    Loop();

}


function ConvertS2W(coords, zoom) { //Screen to world
    return {
        x: camera.x + (coords.x - centre.x) / zoom,
        y: camera.y + (coords.y - centre.y) / zoom
    }
}

function ConvertW2S(coords, zoom) { //World to Screen
    return {
        x: centre.x + (coords.x - camera.x) * zoom,
        y: centre.y + (coords.y - camera.y) * zoom
    }
}