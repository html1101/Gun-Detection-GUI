const {
    contextBridge,
    ipcRenderer
} = require("electron");

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
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            } else console.log("Blocked channel " + channel);
        }
    }
);