// Where connecting to cameras will take place. Values will be stored in cameras.

/*
Cameras can be connected in the following ways:
- RTSP over DVR or NVR
- Over the network (ONVIF)
- Manually enter URL
*/

let cameras = [
    {
        "camera_name": "Hello there!",
        "location": "Office",
        "connection_type": "rtsp",
        "selected": true,
        "address": "192.168.86.39",
        "url": "rtsp://192.168.86.39"
    },
    {
        "camera_name": "Sarah",
        "location": "Porch",
        "connection_type": "rtsp",
        "address": "192.168.86.39",
        "url": "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4"
    },
    {
        "camera_name": "Yo",
        "location": "Coding Den",
        "connection_type": "rtsp",
        "url": "rtsp://rtsp.stream/pattern"
    }
];
