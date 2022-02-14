// Where connecting to cameras will take place. Values will be stored in cameras.

/*
Cameras can be connected in the following ways:
- RTSP over DVR or NVR
- Over the network (ONVIF)
- Manually enter URL
*/

let cameras = [
    // {
    //     "camera_name": "Hello there!",
    //     "location": "Office",
    //     "connection_type": "rtsp",
    //     "selected": true,
    //     "address": "192.168.86.39",
    //     "url": "rtsp://192.168.86.39/stream1"
    // },
    {
        "camera_name": "The Matrix",
        "location": "Coding Den",
        "connection_type": "rtsp",
        "url": "Models/The_Matrix.mp4"
    },
    {
        "camera_name": "Shooter's Grill",
        "location": "Coding Den",
        "connection_type": "rtsp",
        "url": "Models/Shoot_Grill.mp4"
    }
];

// Load camera list using IPC
window.api.send("loadCameraList");

window.api.receive("cameraList", (list) => {
    console.log("LIST SENT: ", list);
    // Add list to cameras variable
    let cams = Object.keys(list);
    for(let i = 0; i < cams.length; i++) {
        if(!(cams[i] in cameras)) {
            cameras[cams[i]] = list[cams[i]];
        }
    }
})