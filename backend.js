const { app, BrowserWindow, ipcMain } = require("electron"),
net = require("net"),
camera_lib = require("./cameras"),
http = require("http"),
{ spawn } = require("child_process");

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
        width: 900,
        height: 700,
        title: "Gun Detection GUI",
        // frame: false,
        webPreferences: {
          nodeIntegration: false, // is default value after Electron v5
          contextIsolation: true, // protect against prototype pollution
          enableRemoteModule: false, // turn off remote
          preload: __dirname + "/preload.js" // use a preload script
        }
    })
    win.setResizable(false)

    let model_type = "MobileNet", // Default model type
    threshold = 0.7 // Default threshold
    // win.setFullScreen(true)
    // win.setFullScreenable(false)

    let url_list = {}; // List of RTSP URLs we are already listening to
    let list_of_cameras = []; // List of cameras as loaded by connect_to_cams.js.

    win.loadFile("Frontend/dashboard.html");
    let cams = new camera_lib();

    ipcMain.on("beginSearch", (info, data) => {
        // On receiving data, tell our renderer about cameras found as they are found.
        if(data == "multicast") {
                // Using ONVIF multicast to find cameras
                console.log("Searching for cameras...");
                cams.searchCameras().then(cam => {
                    // Finished loading, simply tell process we're finished.
                    win.webContents.send("finishedLoading", true);
                });
                cams.emitter.on("addCam", (cam) => {
                    win.webContents.send("cameraInfo", cam);
                });
        } else if(typeof(data) == "object") {
            console.log("BRUTE SEARCH");
            cams.searchCamerasBrute(data).then(cam => {
                // Finished loading, tell process we're finished.
                win.webContents.send("finishedLoading", true);
            });
            
            cams.emitter.on("addCam", (cam) => {
                console.log(cam);
                win.webContents.send("cameraInfo", cam);
            });
        }
        console.log(data);
    });

    ipcMain.on("startRTSP", (info, data) => {
        // Given URL to start RTSP feed, start on a port we send over.
        let get_ip = data["url"].split(":")[0];
        if(!(get_ip in url_list)) {
            getPort((port) => {
                
                // On this end, begin listening to this RTSP url for guns using Python code.
                console.log(`Listening for guns at ${data["url"]}`);
                console.log(model_type, data["url"]);
                script = spawn("python3", ["./Models/evaluate.py", model_type, data["url"], port, threshold]);
                
                // Debug: Print out errors that occur.
                script.stderr.on("data", (chunk) => {
                    console.log(chunk.toString())
                })
                // Tell dashboard to listen to camera feed locally.
                win.webContents.send("newFeed", {...data, "port": port});
                
                url_list[get_ip] = port;
            });
        } else {
            // Remind client the port this RTSP feed is at
            win.webContents.send("newFeed", {...data, "port": url_list[get_ip]});
        }
    });

    ipcMain.on("loadCameraList", (_info, data) => {
        // Send back the list of cameras previously saved
        console.log("LIST", list_of_cameras);
        win.webContents.send("cameraList", list_of_cameras);
    })
    ipcMain.on("saveCameraList", (_info, data) => {
        // Save list of cameras given.
        list_of_cameras = data;
    })
    ipcMain.on("getThreshold", (_info, _data) => {
        win.webContents.send("thresholdValue", threshold);
    })
    ipcMain.on("setThreshold", (_info, data) => {
        threshold = data;

        // Make GET request to each port to change each threshold value.
        let list_url_keys = Object.keys(url_list);
        for(let i = 0; i < list_url_keys.length; i++) {
            let options = {
                hostname: "localhost",
                port: url_list[list_url_keys[i]],
                path: `/changeThresh?threshold=${threshold}`,
                method: "GET"
            }
            console.log(options);

            let req = http.request(options, _res => {});
            req.end()
        }
    })
}

app.whenReady().then(() => {
    createWindow();
});