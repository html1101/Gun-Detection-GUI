const { app, BrowserWindow } = require("electron");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Gun Detection GUI"
    })

    win.loadFile("Frontend/index.html")
}

app.whenReady().then(() => {
    createWindow()
})