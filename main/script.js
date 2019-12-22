let socket = io();
let yourId = 0;
let room = "main";
yourId = socket.id;
socket.on("PlayerJoined", (id) => {

  players[id] = new Player(0, 0);
})
socket.on("PlayerInfoRecieved", (id, name, colour) => {

  players[id].name = name;
  players[id].colour = colour;


})
socket.on("PlayerKeyChange", (id, keys, x, y) => {
  players[id].keys = copyObject(keys);
  players[id].x = x;
  players[id].y = y;
})
socket.on("PlayerLeave", (id) => {
  delete players[id];
})
socket.on("GetPlayers", (info, id) => {
  players[id] = new Player(0, 0);
  players[id].x = info.x;
  players[id].y = info.y;
  players[id].keys = copyObject(info.keys);
  players[id].name = info.name;
  players[id].colour = info.colour;
  players[id].shapes = info.shapes;
  players[id].shape = info.shape;
})
socket.on("message", (id, message) => {
  if (id == socket.id)
    players[0].Message(message);
  else
    players[id].Message(message);
})
socket.on("AddLine", (id, x, y) => {
  players[id].AddLine(x, y);
})
socket.on("EndShape", (id) => {
  players[id].EndShape();
})
socket.on("UndoShape", id => {
  players[id].UndoShape();
})
socket.on("Rotate", (angle, id) => {
  players[id].angle = angle;
})
socket.on("ShootGun", (bullet, id) => {
  players[id].bullets.push(bullet); //the ShootGun() function will just repeat what is already done. This simplifies it.
})
let keys = [];
let keyMat = { //previous keys
  left: false,
  right: false,
  up: false,
  down: false
}
document.addEventListener("keydown", function (e) {
  keys[e.key] = true;
})
document.addEventListener("keyup", function (e) {
  keys[e.key] = false;
})
let mouse = {
  x: 0,
  y: 0,
  isDown: false
};
document.addEventListener("mousedown", function () {

  if (room == "main") {
    players[0].AddLine(mouse.x - c.width / 2, mouse.y - c.height / 2);
    socket.emit("AddLine", mouse.x - c.width / 2, mouse.y - c.height / 2);
  }

  mouse.isDown = true;
})
document.addEventListener("mouseup", function () {
  if (room == "main") {
    socket.emit("EndShape");
    players[0].EndShape();
  }

  mouse.isDown = false;
})
document.addEventListener("mousemove", function (e) {
  mouse.x = e.clientX - c.getBoundingClientRect().left
  mouse.y = e.clientY - c.getBoundingClientRect().top
  if (mouse.isDown) {
    if (room == "main") {
      players[0].AddLine(mouse.x - c.width / 2, mouse.y - c.height / 2);
      socket.emit("AddLine", mouse.x - c.width / 2, mouse.y - c.height / 2);
    }
  }
})
let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight * 0.95;

let textbar = document.getElementById("textbar");
textbar.onsubmit = () => {
  keys["Enter"] = false; //because Enter selects the input text field
  let textinput = document.getElementById("textinput");

  let m = textinput.value;
  let isCommand = false;
  if (m[0] == "/") {
    isCommand = true;
  }
  if (!isCommand) {
    socket.emit("message", m);
  } else {
    let command = m.substring(1, m.length).split(" ");
    if (command[0] == "goto") { //go to a room
      if (command[1] == "gun") {
        socket.emit("ChangeRoom", "GunGame");
        room = "gun";
      } else if (command[1] == "main") {
        socket.emit("ChangeRoom", "Main");
        room = "main";
      } else {
        players[0].Message("Hey, what are you doing? You don't have a room specified!");
        textinput.value = "";
        textinput.blur();
        return false;
      }
      for (player in players) {
        if (player != 0) delete players[player];
      }
      for (let i = players[0].shapes.length - 1; i >= 0; i--) {
        players[0].shapes.splice(i, 1);
      }
      players[0].shapes[0] = [];
      players[0].shape = 0;
      players[0].x = 0;
      players[0].y = 0;
    } else if (command[0] == "setname") { //change name
      SetName(command[1]);
    } else if (command[0] == "setcolour") { //change colour
      SetColour(command[1]);
    }

  }

  textinput.value = "";
  textinput.blur();
  return false;
}

function sameObject(ob1, ob2) {
  for (i in ob1) { //Go through ob1
    if (ob2[i] != ob1[i]) return false;
  }
  for (i in ob2) { //Go through ob2
    if (ob2[i] != ob1[i]) return false;
  }
  return true;
}

function copyObject(object) {
  let ob = new Object();
  for (i in object) {
    ob[i] = object[i];
  }
  return ob;
}

function SetName(name) {
  players[0].name = name;
  socket.emit("sendInfo", name, players[0].colour);
}

function SetColour(colour) {
  players[0].colour = colour;
  socket.emit("sendInfo", players[0].name, colour);
}

let players = []; //Players will be indexed by their ID
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.colour = null;
    this.name = "Choosing a name";
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false
    }
    this.shapes = []; //Contains an array of arrays of lines
    this.shapes[0] = [];
    this.shape = 0; //Current shape
    this.bullets = [];
    this.gun = 0; //0 is pistol with one shot, 1 is sniper with longer reload time, 2 is rocket launcher with longest reload time and slower walking but most damage
    this.bulletTimer = 0;
    this.health = 100;
    this.angle = 0;
  }
  Draw() {
    ctx.fillStyle = this.colour;
    ctx.fillRect((this.x + c.width / 2) - 5, (this.y + c.height / 2) - 5, 10, 10);
    ctx.fillStyle = "black";
    let textWidth = ctx.measureText(this.name);
    ctx.fillText(this.name, (this.x + c.width / 2) - textWidth.width / 2, (this.y + c.height / 2) + 15);
    if (room == "gun") {
      ctx.fillStyle = "red";
      ctx.fillRect((this.x + c.width / 2) - 50, (this.y + c.height / 2) - 30, 100, 10);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect((this.x + c.width / 2) - 50, (this.y + c.height / 2) - 30, this.health, 10);
    }
  }
  Update() {
    if (this.keys.up) this.y--;
    if (this.keys.down) this.y++;
    if (this.keys.left) this.x--;
    if (this.keys.right) this.x++;
  }
  Message(message) {
    messages.push(new Message(message, this.x, this.y - 15))
  }
  AddLine(x, y) {
    if (room == "main")
      this.shapes[this.shape].push([x, y]);
    else {
      this.Message("You fucking donkey");
    }
  }
  EndShape() {
    if (room == "main") {
      this.shape++;
      this.shapes[this.shape] = [];
      if (this.shapes[this.shape - 1].length == 1) {
        socket.emit("UndoShape");
        this.UndoShape();
      }
    } else {
      this.Message("You fucking donkey");
    }
  }
  DrawShape() {
    if (room == "main") {
      for (let i = 0; i < this.shapes.length; i++) {
        ctx.beginPath();
        for (let j = 0; j < this.shapes[i].length; j++) {
          if (j == 0) ctx.moveTo(this.shapes[i][j][0] + c.width / 2, this.shapes[i][j][1] + c.height / 2);
          ctx.lineTo(this.shapes[i][j][0] + c.width / 2, this.shapes[i][j][1] + c.height / 2);
        }
        ctx.stroke();
      }
    } else {
      this.Message("You fucking donkey");
    }
  }
  UndoShape() {
    if (room == "main") {
      this.shapes.splice(this.shape - 1, 1);
      this.shape--;
      this.shape = Math.max(this.shape, 0);
      this.shapes[this.shape] = [];
    } else {
      this.Message("You fucking donkey");
    }
  }
  ShootGun() {
    if (room == "gun") {
      let speed = 0;
      let damage = 20;
      if (this.gun == 0) speed = 15;
      else if (this.gun == 1) speed = 20;
      else if (this.gun == 2) speed = 1;
      if (this.gun == 1) damage = 50;
      else if (this.gun == 2) damage = 100;
      let bullet = {
        type: this.gun,
        speed: speed,
        x: this.x,
        y: this.y,
        // angle: Math.atan2(mouse.x - this.x - c.width / 2, mouse.y - this.y - c.height / 2),
        angle: this.angle,
        damage: damage
      }
      this.bullets.push(bullet);
      socket.emit("ShootGun", bullet);
    } else {
      this.Message("You fucking donkey");
    }

  }
  UpdateBullets() {
    if (room == "gun") {
      if (mouse.isDown || this.bulletTimer > 0)
        this.bulletTimer++;
      if (this.gun == 0) this.bulletTimer %= 10;
      if (this.gun == 1) this.bulletTimer %= 20;
      if (this.gun == 2) this.bulletTimer %= 50;

      for (let i = 0; i < this.bullets.length; i++) {
        if (this.gun == 2) this.bullets[i].speed *= 1.05;
        let maxIterations = 2;
        let iters = 0;
        while (iters <= maxIterations) {
          this.bullets[i].x += Math.sin(this.bullets[i].angle) * this.bullets[i].speed / 2;
          this.bullets[i].y += Math.cos(this.bullets[i].angle) * this.bullets[i].speed / 2;

          for (p in players) {
            let player = players[p];
            if (player != this) {
              let xDist = player.x - this.bullets[i].x;
              let yDist = player.y - this.bullets[i].y;
              let dist = Math.sqrt(xDist ** 2 + yDist ** 2);

              if (dist < 10) {
                player.health -= this.bullets[i].damage / 2;
                player.health = Math.max(player.health, 0);
              }
            }

          }

          iters++;
        }
        if (Math.sqrt(this.bullets[i].x ** 2 + this.bullets[i].y ** 2) > 1000) {
          this.bullets.splice(i, 1);
          i--;
        }
      }
    } else {
      this.Message("You fucking donkey");
    }
  }
  DrawBullets() {
    for (let i = 0; i < this.bullets.length; i++) {
      let thickness = Math.min(10 - this.bullets[i].speed / 2, 10);
      let length = Math.max(this.bullets[i].speed / 2 + 10, 10);
      let vector = {
        x: Math.sin(this.bullets[i].angle), //used to make some sort of bleh
        y: Math.cos(this.bullets[i].angle)
      }
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(this.bullets[i].x - (vector.x * length) + c.width / 2, this.bullets[i].y - (vector.y * length) + c.height / 2);
      ctx.lineTo(this.bullets[i].x + c.width / 2, this.bullets[i].y + c.height / 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }
  DrawGun() {
    let x = Math.sin(this.angle);
    let y = Math.cos(this.angle);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#7F7F7F";
    ctx.beginPath();
    ctx.moveTo(this.x + c.width / 2, this.y + c.height / 2);
    ctx.lineTo(this.x + x * 30 + c.width / 2, this.y + y * 30 + c.height / 2);
    ctx.stroke();
  }
}
let messages = [];
class Message {
  constructor(message, x, y) {
    this.message = message;
    this.x = x;
    this.y = y;
    this.time = 0;
    this.done = false;
  }
  Update() {
    if (this.time == this.message.length * 20) {
      this.done = true;
    }
    this.time++;
  }
  Draw() {
    let length = ctx.measureText(this.message).width;
    ctx.globalAlpha = this.message.length * 2 - this.time / 10;
    ctx.fillStyle = "white";
    ctx.fillRect(this.x - length / 2 + c.width / 2 - 5, this.y + c.height / 2 - 10, length + 10, 15)
    ctx.fillStyle = "black";


    ctx.fillText(this.message, this.x - length / 2 + c.width / 2, this.y + c.height / 2);
    ctx.globalAlpha = 1;
  }
}



players[0] = new Player(0, 0);

let name = prompt("What is your name?");
let colour = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
if (name.length > 50) {
  name.splice(50, name.length - 50);
}
players[0].name = name;
players[0].colour = colour;

socket.emit("sendInfo", name, colour);
let undoPressed = false; //You don't want all of your stuff gone
function Loop() {

  ctx.clearRect(0, 0, c.width, c.height);
  if (keys["ArrowUp"]) {
    players[0].keys.up = true;
  } else players[0].keys.up = false;
  if (keys["ArrowDown"]) {
    players[0].keys.down = true;
  } else players[0].keys.down = false;
  if (keys["ArrowLeft"]) {
    players[0].keys.left = true;
  } else players[0].keys.left = false;
  if (keys["ArrowRight"]) {
    players[0].keys.right = true;
  } else players[0].keys.right = false;
  while (messages.length > 20) {
    messages.shift();
  }
  if (keys["t"] || keys["Enter"]) {
    document.getElementById("textinput").focus();
  }
  if (keys["Control"] && keys["z"] && !undoPressed) {
    players[0].UndoShape();
    socket.emit("UndoShape");
    undoPressed = true;
  } else if (!keys["Control"] || !keys["z"]) {
    undoPressed = false;
  }
  if (room == "gun" && mouse.isDown && players[0].bulletTimer == 0) {
    players[0].ShootGun();
  }
  if (!sameObject(keyMat, players[0].keys)) {
    socket.emit("keychange", players[0].keys, players[0].x, players[0].y);
    keyMat = copyObject(players[0].keys)
  }
  let newAngle = Math.atan2(mouse.x - players[0].x - c.width / 2, mouse.y - players[0].y - c.height / 2);
  if (players[0].angle != newAngle) socket.emit("Rotate", newAngle);
  players[0].angle = newAngle;
  for (p in players) {
    let player = players[p];
    if (room == "main")
      player.DrawShape();
    else if (room == "gun") {
      player.UpdateBullets();
      player.DrawBullets();
      player.DrawGun();

    }
    player.Update();
    player.Draw();
  }
  for (let i = 0; i < messages.length; i++) {
    let message = messages[i];
    message.Update();
    message.Draw();
    if (message.done) {
      messages.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(Loop);
}
window.onload = () => Loop();