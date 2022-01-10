// We will search for cameras over ONVIF or looking through a DVR.
const events = require("events"),
onvif = require("onvif"),
Stream = require("node-rtsp-stream")

/** IF:
 * - Using DVR: Enter DVR IP address, username, password, and search for video streams available on DVR.
 * - Camera connected over network, don't know IP: Use ONVIF to search for camera
 * - Camera connected over network, know IP: Check RTSP feed URL
 * ** TODO: Allow brute force search **
 */

const checkRTSPStream = (url, callback) => {
    let stream = new Stream({
        name: "Stream",
        streamUrl: url,
        audio: false,
        wsPort: 9999
    })
    stream.on("camdata", () => {
        stream.stop()
        callback(true);
    })
    stream.mpeg1Muxer.on('ffmpegStderr', () => {
        // Err
        stream.stop();
        callback(false);
    })
}

class Cameras {
    constructor(camera_configuration) {
        // Initialize our emitter. This is how we'll tell listeners when we're adding a camera.
        this.emitter = new events.EventEmitter();
    }
    /**
     * Search for cameras on the network using ONVIF.
     * @param {number} search_timeout Search timeout in ms.
     */
    async searchCameras(search_timeout = 5000) {
        // After search_timeout ms, we stop searching.
        let cam_list = [];
        const camera = this;

        let promise = new Promise((res, rej) => {
            setTimeout(() => {
                res(cam_list);
            }, search_timeout);
        });

        onvif.Discovery.on('device', function(cam,rinfo,xml){
            // function will be called as soon as NVT responds
            let addr = rinfo.address;
            cam_list.push(addr);
            camera.emitter.emit("addCam", addr);
        })
        
        onvif.Discovery.probe();
        console.log("Beginning search for cameras.");
        return await promise;
    }

    /**
     * Given the IP address of a DVR, find RTSP feeds (currently only compatible with CCTV cameras).
     * @param {*} ip_addr 
     * @param {*} username
     * @param {*} password
     * @param {*} port
     */
    async findDVRCams(ip_addr, username = "admin", password = "admin", port = 554) {
        // Go through URL: rtsp://{username}:{password}@{ip_addr}:{port}/live/main{cam #}
        let num_cams = 0;
        while(true) {
            // Check if awake.
            let status = new Promise((res, rej) => {
                checkRTSPStream(`rtsp://${username}:${password}@${ip_addr}:${port}/live/main${num_cams}`, (stat) => {
                    if(!stat) res([num_cams, false]); // Could not connect to this RTSP feed, stop adding cams
                    else res([++num_cams, true]);
                })
            });
            if(!(await status)[1]) return num_cams;
        }
    }

    async checkRTSPStream(...args) {
        checkRTSPStream(...args);
    }
}

/* Sample:
let cams = new Cameras();

cams.searchCameras().then(val => {
    console.log(val)
})

cams.findDVRCams("192.168.86.39").then(num_cams => {
    console.log(`Cameras found on this DVR: ${num_cams}`)
})

*/