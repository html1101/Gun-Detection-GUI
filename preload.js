const {
    contextBridge,
    ipcRenderer
} = require("electron");

const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    let titlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex("#1E1D1E"),
        shadow: true,
        maximizable: false,
        minimizable: false,
        itemBackgroundColor: customTitlebar.Color.LIGHTGREY,
        onClose: () => ipcRenderer.send('window-close'),
        isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
        onMenuItemClick: () => {}
    });

    titlebar.updateTitle("Gun Detection GUI");
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["beginSearch", "confirmIP", "startRTSP", "loadCameraList", "saveCameraList", "getThreshold", "setThreshold"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            } else console.log("Blocked channel " + channel);
        },
        receive: (channel, func) => {
            let validChannels = ["cameraInfo", "finishedLoading", "newFeed", "cameraList", "thresholdValue"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                console.log(channel);
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            } else console.log("Blocked channel " + channel);
        }
    }
);