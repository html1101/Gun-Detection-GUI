const { app, BrowserWindow, ipcMain } = require("electron"),
net = require("net"),
Stream = require('node-rtsp-stream'),
camera_lib = require("./cameras");

const getPort = (callback) => {
    let server = net.createServer()
    server.listen(0, (err) => {
        // Gives us available port, return port
        let port = server.address().port
        server.close();
        callback(port);
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Gun Detection GUI",
        webPreferences: {
          nodeIntegration: false, // is default value after Electron v5
          contextIsolation: true, // protect against prototype pollution
          enableRemoteModule: false, // turn off remote
          preload: __dirname + "/preload.js" // use a preload script
        }
    })

    win.loadFile("Frontend/dashboard.html");
    let cams = new camera_lib();

    ipcMain.on("beginSearch", (info, data) => {
        // On receiving data, tell our renderer about cameras found as they are found.
        switch(data) {
            case "multicast":
                // Using ONVIF multicast to find cameras
                console.log("Searching for cameras...");
                cams.searchCameras().then(cam => {
                    // Finished loading, simply tell process we're finished.
                    win.webContents.send("finishedLoading", true);
                });
                cams.emitter.on("addCam", (cam) => {
                    win.webContents.send("cameraInfo", cam);
                })
                break;
            case "":
                break;
            default:
                break;
        }
    });

    ipcMain.on("startRTSP", (info, data) => {
        // Given URL to start RTSP feed, start on a port we send over.
        getPort((port) => {
            // Now create stream on this open port
            let stream = new Stream({
                name: "Stream",
                streamUrl: data["url"],
                wsPort: port,
                ffmpegOptions: {
                    // "-crf": 28
                }
            });
            let sent_newfeed = false;
            stream.on("camdata", () => {
                // We successfully started the feed, now inform preloader => renderer
                if(!sent_newfeed) {
                    win.webContents.send("newFeed", {...data, "port": port});
                    sent_newfeed = true;
                }
            });
            // // Critical error
            // stream.mpeg1Muxer.on('ffmpegStderr', () => {
            //     stream.stop();
            //     // Inform preloader => renderer
            //     console.log("Failed feed");
            //     win.webContents.send("failedFeed", data["cam_id"]);
            //     return;
            // });
        });
    });
}

app.whenReady().then(() => {
    createWindow();
});