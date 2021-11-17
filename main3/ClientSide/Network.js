function InitSocketEvents(socket) {
    socket.on("message", (id, message) => {
        chatBox.classList.value = "";
        AddMessage(id, message);
        void chatBox.offsetWidth;
        chatBox.classList.value = "hideButLonger";
    });
}