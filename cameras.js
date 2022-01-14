// We will search for cameras over ONVIF or looking through a DVR.
const events = require("events"),
    onvif = require("onvif"),
    Cam = onvif.Cam,
    Stream = require("node-rtsp-stream")

/** IF:
 * - Using DVR: Enter DVR IP address, username, password, and search for video streams available on DVR.
 * - Camera connected over network, don't know IP: Use ONVIF to search for camera
 * - Camera connected over network, know IP: Check RTSP feed URL
 * ** TODO: Allow brute force search **
 */

const username = "admin",
    password = "admin"

    //toLong taken from NPM package 'ip' 
function toLong(ip) {
    var ipl = 0;
    ip.split('.').forEach(function(octet) {
        ipl <<= 8;
        ipl += parseInt(octet);
    });
    return (ipl >>> 0);
   }
   
//fromLong taken from NPM package 'ip' 
function fromLong(ipl) {
return ((ipl >>> 24) + '.' +
    (ipl >> 16 & 255) + '.' +
    (ipl >> 8 & 255) + '.' +
    (ipl & 255) );
}
   
function generate_range(start_ip, end_ip) {
    var start_long = toLong(start_ip);
    var end_long = toLong(end_ip);
    if (start_long > end_long) {
        var tmp = start_long;
        start_long = end_long
        end_long = tmp;
    }
    var range_array = [];
    var i;
    for (i = start_long; i <= end_long; i++) {
        range_array.push(fromLong(i));
    }
    return range_array;
}

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

    async searchCamerasBrute(search_options, search_timeout=3000) {
        // Search cameras, brute force. Given a range of IPs, search over and check.
        let range_ips = generate_range(search_options["ip_start"], search_options["ip_end"]);

        const camera = this;

        let camera_list = [];

        let promise = new Promise((res, rej) => {
            setTimeout(() => {
                res(camera_list);
            }, search_timeout);
        });

        range_ips.forEach(ip => {
            new Cam({
                hostname: ip,
                username: username,
                password: password,
                port: 80,
                timeout: search_timeout
            }, function CamErr(err) {
                if (err)  {
                    return;
                }

                let run = this;
                run.getStreamUri({
                    protocol: 'RTSP',
                    stream: 'RTP-Unicast'
                }, function (err, stream, xml) {
                    if (err) { console.log("ERR"); return; };
                    // Now get information about the manufacturer, etc of this camera
                    run.getDeviceInformation((err, info, xml) => {
                        // Now we have distinguishing info and a RTSP url.
                        let inf = {
                            "address": ip,
                            "url": stream.uri,
                            ...info
                        };
                        camera.emitter.emit("addCam", inf);
                        camera_list.push(inf);
                    });
                });

            })
        });
        return await promise;
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

        onvif.Discovery.on('device', function (cam, rinfo, xml) {
            // function will be called as soon as NVT responds
            let addr = rinfo.address;
            console.log("Foun: ", addr);

            // Find RTSP address
            let this_cam = new Cam({
                hostname: addr,
                username: username,
                password: password,
                timeout: 5000
            }, function(err) {
                let run = this;
                run.getStreamUri({
                    protocol: 'RTSP',
                    stream: 'RTP-Unicast'
                }, function (err, stream, xml) {
                    if (err) { console.log("ERR"); return; };
                    // Now get information about the manufacturer, etc of this camera
                    run.getDeviceInformation((err, info, xml) => {
                        // Now we have distinguishing info and a RTSP url.
                        console.log("INFO: ", addr, stream);
                        camera.emitter.emit("addCam", {
                            "address": addr,
                            "url": stream["uri"],
                            ...info
                        });
                    });
                });
            });
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
        while (true) {
            // Check if awake.
            let status = new Promise((res, rej) => {
                checkRTSPStream(`rtsp://${username}:${password}@${ip_addr}:${port}/live/main${num_cams}`, (stat) => {
                    if (!stat) res([num_cams, false]); // Could not connect to this RTSP feed, stop adding cams
                    else res([++num_cams, true]);
                })
            });
            if (!(await status)[1]) return num_cams;
        }
    }

    async checkRTSPStream(...args) {
        checkRTSPStream(...args);
    }
}

/* Sample: */
let cams = new Cameras();

// cams.searchCamerasBrute({
//     "ip_start": "192.168.15.1",
//     "ip_end": "192.168.15.254"
// }).then(res => {
//     console.log(res);
// })

/*cams.searchCameras().then(val => {
    console.log(val)
})*/

/*cams.findDVRCams("192.168.86.39").then(num_cams => {
    console.log(`Cameras found on this DVR: ${num_cams}`)
})
*/

module.exports = Cameras;