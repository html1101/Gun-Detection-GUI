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
        "ip_address": "192.168.86.39",
        "url": "rtsp://192.168.86.39"
    },
    {
        "camera_name": "Sarah",
        "location": "Porch",
        "connection_type": "rtsp",
        "ip_address": "192.168.86.39",
        "url": "rtsp://192.168.86.39"
    }
];
