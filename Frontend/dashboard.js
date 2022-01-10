// Allow to drag event-list height
let drag_elem = document.getElementById("drag-top")

const container = document.getElementById("body");

let mouse_is_down = false;
drag_elem.addEventListener("mousedown", (evt) => {
    mouse_is_down = true;
    document.body.style.cursor = "n-resize";
});
document.onmouseup = (e) => { mouse_is_down = false; document.body.style.cursor = "auto"; }

document.addEventListener("mousemove", (e) => {
    if(mouse_is_down) {
        let offsetDown = container.clientHeight - (e.clientY - container.offsetTop);

        if(offsetDown > 150 && offsetDown < 300) {
            document.body.style.setProperty("--event-height", offsetDown + "px");
        }
    }
})

// Go through cameras and place them in each space.
for(let i = 1; i <= 5; i++) {
    if(cameras[i - 1]) {
        document.querySelector(`.spot${i} > .top-bit`).innerText = cameras[i - 1].camera_name;

        // Manage each type of connection. If over RTSP, start from URL given.
    } else {
        // Display image: no camera connected.
        document.querySelector(`.spot${i}`).style.backgroundImage = `url("No-Cam-Connected.png")`
    }
}