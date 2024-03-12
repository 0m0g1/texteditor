const {ipcRenderer} = require("electron");

const textArea = document.querySelector("#textarea");

window.onkeydown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key == "s") {
        event.preventDefault();
        ipcRenderer.send("save-content", textArea.value);
    } 
}

ipcRenderer.on("file-opened", (event, data) => {
    textArea.textContent = data;
})