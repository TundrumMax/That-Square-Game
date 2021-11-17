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
                socket.emit("message", chatInput.value); //send the message through
                AddMessage(0, chatInput.value);
                chatBox.classList.value = "hideButLonger";
            } else {
                PerformCommand(chatInput.value.substr(1), roomContainer);
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

function AddMessage(playerID, message) {
    let currentScroll = chatBox.scrollTop;
    let max = chatBox.scrollHeight - chatBox.clientHeight;

    let el = document.createElement("div");
    el.id = "chatMessage";
    el.innerText = playerID + ": " + message;
    chatBox.appendChild(el);
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








function PerformCommand(input, roomContainer) {
    let separated = input.split(" ");
    switch (separated[0]) {
        case "goto":
            let e = ChangeRoom(roomContainer, separated[1]);
            if (e) {
                console.error(e);
            }
    }
}