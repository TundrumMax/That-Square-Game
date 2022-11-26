let chatInput = document.getElementById("textInput");
let chatBox = document.getElementById("chatBox");
chatInput.value = "";
let chatOpen = false;

function ToggleChat(socket, roomContainer) {
    chatOpen = document.activeElement != chatInput;
    if (!chatOpen) {
        let len = chatInput.value.length;
        if (len > 0) {
            if (chatInput.value[0] != "/") {
                if (!enableDevMode)
                    socket.emit("message", chatInput.value); //send the message through
                AddMessage(0, chatInput.value, roomContainer.room);
                chatBox.classList.value = "hideButLonger";
            } else {
                PerformCommand(chatInput.value.substr(1), roomContainer, socket);
                chatBox.classList.value = "hide";
            }
        } else {
            chatBox.classList.value = "hide"; //lol
        }
        chatInput.value = ""; //awkward stuff to hide the chat bar
        chatInput.focus();
        chatInput.blur();
        chatInput.classList.value = "hide";

    } else {
        chatInput.classList.value = ""; //show the chatbox and chat bar
        chatBox.classList.value = "";
        chatInput.focus(); //select the chat bar so that the user can immediately start typing
    }
}

let maxMessages = 20;
let yayNae = 0;

function AddMessage(playerID, message, room) {
    let currentScroll = chatBox.scrollTop;
    let max = chatBox.scrollHeight - chatBox.clientHeight;

    let el = document.createElement("div");
    el.id = "chatMessage";

    el.innerText = room.players[playerID].name + ": " + message;


    chatBox.appendChild(el);
    room.players[playerID].messages.push({
        message: message,
        age: 0
    });
    if (currentScroll == max) { //if the scroll before adding a new message was already at max, then set it to max after adding the new message
        chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
    }
    while (chatBox.children.length - yayNae > maxMessages) {
        let f = chatBox.firstChild;
        chatBox.removeChild(f);
        yayNae = 1 - yayNae;
    }
}

function CloseChat() { //close chat box without removing message, for when the user clicks out of the chatbox
    chatInput.focus();
    chatInput.blur();
    chatInput.classList.value = "hide";
    chatBox.classList.value = "hide";
    chatOpen = false;

}
window.onclick = e => { //oh boyyyy. Check if the user clicked outside the chatBox + chatBar while it was open
    if (chatOpen) //run only if the thing is actually open lmao
        if (e.target != chatBox && e.target != chatInput && e.target.parentElement != chatBox) {
            CloseChat();
        }
}








function PerformCommand(input, roomContainer, socket) {
    let separated = input.split(" ");
    let type = roomContainer.room.playerType;
    switch (separated[0].toLowerCase()) {
        case "goto":
            destRoomName = separated[1];
            destRoomType = separated[2];
            let e;
            if (!enableDevMode)
                e = RequestRoomChange(socket, separated[1]);
            else
                ChangeRoom(roomContainer, socket, {
                    exists: false
                });
            if (e) {
                console.error(e);
            }
            break;
        case "setpaint":
            if (type == "draw") { //prevents shenanigans
                roomContainer.room.players[0].drawColour = separated[1];
                if (!enableDevMode)
                    socket.emit("CSetPaint", separated[1]);
            }
            break;
        case "setname":
            roomContainer.room.players[0].name = separated[1];
            if (!enableDevMode)
                socket.emit("CSetName", separated[1]);
            break;
        case "setcolour":
            roomContainer.room.players[0].colour = separated[1];
            if (!enableDevMode)
                socket.emit("CSetColour", separated[1]);
            break;
    }
}