// Allow to drag event-list height
let drag_elem = document.getElementById("drag-top")

const container = document.getElementById("body");

let callback = (info) => { }, callbackFinished = () => { }

let mouse_is_down = false;
drag_elem.addEventListener("mousedown", (evt) => {
    mouse_is_down = true;
    document.body.style.cursor = "n-resize";
});
document.onmouseup = (e) => { mouse_is_down = false; document.body.style.cursor = "auto"; }

document.addEventListener("mousemove", (e) => {
    if (mouse_is_down) {
        let offsetDown = container.clientHeight - (e.clientY - container.offsetTop);

        if (offsetDown > 150 && offsetDown < 300) {
            document.body.style.setProperty("--event-height", offsetDown + "px");
        }
    }
})

// Go through cameras and place them in each space.
const refreshCameras = () => {
    for (let i = 1; i <= 6; i++) {
        if (cameras[i - 1]) {
            console.log(`.spot${i} > .top-bit`)
            document.querySelector(`.spot${i} > .top-bit`).innerText = cameras[i - 1].camera_name ? cameras[i - 1].camera_name : cameras[i - 1].address;

            // Manage each type of connection. If over RTSP, start from URL given.
            // Start stream!
            window.api.send("startRTSP", { "url": cameras[i - 1]["url"], "cam_id": i });
            document.querySelector(`.spot${i} .cam_spot`).src = "loading-cam.png";
        } else {
            // Display image: no camera connected.
            let doc = document.querySelector(`.spot${i} .cam_spot`)
            let wid = parseInt(getComputedStyle(doc.parentElement).width),
                hei = parseInt(getComputedStyle(doc.parentElement.parentElement).height)
            if (wid > hei) doc.style.height = hei + "px";
            else doc.style.width = wid + "px";

            if (wid > hei) doc.style.height = hei + "px";
        }
    }
};

refreshCameras();

window.api.receive("cameraList", (list) => {
    // List of cameras received, now refresh
    refreshCameras();
});

// On notification that there's a new feed, display it.
window.api.receive("newFeed", (data) => {
    // Open port data["port"] for this div.
    console.log("Opening a new port: ", data);
    let doc = document.querySelector(`.spot${data["cam_id"]} .cam_spot`)
    doc.src = `http://localhost:${data["port"]}`
    doc.onerror = () => {
        // Error loading, try again if no cam connected
        doc.src = `http://localhost:${data["port"]}`;
    }

    // We need to scale so that the RTSP feed is not squeezed. Resize width or height (height if width > height, width if height > width)
    let wid = parseInt(getComputedStyle(doc.parentElement).width),
        hei = parseInt(getComputedStyle(doc.parentElement.parentElement).height)
    if (wid > hei) doc.style.height = hei + "px";
    else doc.style.width = wid + "px";

    console.log("Playing: " + `http://localhost:${data["port"]}` + " on: ", doc);
})


/* Navigating through camera connection options. */

let state_connection = "slide_1",
    prev_ip = [];

// On clicking next, show tailored content depending on which radio button they selected.
document.querySelector(`#${state_connection} .next_btn`).addEventListener("click", (evt) => {
    // Check which button was pressed, read its value, then show that slide.
    let radio_btn = Array(...document.querySelectorAll(`#${state_connection} input[type="radio"]`)).filter(val => val.checked)[0];

    // Before moving, ensure that all inputs grouped with this radio are filled out.
    let not_entered = Array(...radio_btn.parentElement.querySelectorAll("input")).filter(val => !val.value);
    if (not_entered.length) {
        // Display these in red.
        for (i in not_entered) {
            not_entered[i].style.borderBottom = "1.5px solid red";
        }
    } else {
        let radio_value = radio_btn.value;
        let slide_elem = document.getElementById(`hide${radio_value}`);
        document.getElementById(state_connection).style.display = "none";
        slide_elem.style.display = "block";

        // Based on radio_value, ask for different things from our ipcMain process.
        console.log("Sending.")
        window.api.send(
            radio_value.startsWith("_Search") ? "beginSearch" : "confirmIP",
            (radio_value == "_Search" ? "multicast" : (radio_value == "_Search_Advanced" ? { "ip_start": radio_btn.parentElement.querySelector(".start").value, "ip_end": radio_btn.parentElement.querySelector(".end").value } : "IP HERE"))
        );

        // On finding cameras, add to a table.
        if (radio_value.startsWith("_Search")) {
            slide_elem.querySelectorAll(".cam_list").innerHTML = "";
            callback = (info) => {
                if (prev_ip.indexOf(info["address"]) == -1) {
                    prev_ip.push(info["address"]);
                    // Display a little + on hover to add this camera
                    let new_elem = document.createElement("div");
                    new_elem.innerHTML = `${info["address"]} - ${info["manufacturer"]} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi add_cam_button" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                    </svg>`;

                    slide_elem.querySelector(".cam_list").appendChild(new_elem)
                    let add_cam_btn = new_elem.querySelector(".add_cam_button");

                    let cam_selected = false;
                    new_elem.addEventListener("mouseenter", () => { (!cam_selected) ? add_cam_btn.style.opacity = "1" : "" });
                    new_elem.addEventListener("mouseleave", () => { (!cam_selected) ? add_cam_btn.style.opacity = "0" : "" });

                    add_cam_btn.addEventListener("click", () => {
                        // Turn into check box
                        if (!cam_selected) {
                            add_cam_btn.innerHTML = `<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>`;
                            add_cam_btn.style.fill = "var(--select-col)";
                            add_cam_btn.style.opacity = "1 !important";

                            // Add camera to cameras
                            cam_selected = true;
                            cameras.push(info);
                            refreshCameras();
                        }
                    })
                }
            }
            callbackFinished = () => {
                slide_elem.querySelector(".big-text").innerText = "Search Complete!"
            }

            // On clicking next, show success page.
            slide_elem.querySelector(".next_btn").addEventListener("click", (evt) => {
                // Hide this slide and move to hide_Success.
                slide_elem.style.display = "none";

                document.getElementById("hide_Success").style.display = "block";
            })
        }
    }
});

window.api.receive("cameraInfo", (data) => {
    console.log(`Received from main process: `, data);
    callback(data);
});
window.api.receive("finishedLoading", (data) => {
    console.log(`Received ${data} from main process`);
    callbackFinished();
});

const popupToggle = (state = "off") => {
    document.getElementById("add_cam_popup").style.display = state == "off" ? "none" : "block";
    document.getElementById("full-cover").style.display = state == "off" ? "none" : "block";

    document.querySelectorAll("[id^='hide_'").forEach((elem) => { elem.style.display = "none" });
    document.getElementById("slide_1").style.display = "block";
}

document.querySelector(".next_btn_close").addEventListener("click", () => {
    popupToggle();
})

document.getElementById("full-cover").addEventListener("click", () => {
    popupToggle();
})

document.getElementById("add_elem").addEventListener("click", (evt) => {
    // On click of button, show add camera screen
    popupToggle("on");
})

window.onbeforeunload = function () {
    // Save camera list
    window.api.send("saveCameraList", cameras);
    return null;
}


// Check status of guns detected using /getLog.
let detections = [];

let status_check = new XMLHttpRequest();
status_check.onreadystatechange = function() {
    if(status_check.status == 200 && status_check.readyState == 4) {
        status_check.innerHTML.split("\n").forEach(line => {
            // Each line will contain "GUN detected at [time] with []% accuracy". Get time and check if detection already made.
            let time = new Date(line.split("GUN detected at ").join("").split(" with ")[0]);
            if(!(time in detections)) {
                // Put time in detections and append to list of guns
                let new_elem = document.createElement("tr");
                new_elem.innerHTML = `<tr>${time}</tr><tr>${line}</tr>`
                detections.push(time);
            }
        })
    }
};
setInterval(() => {
    // Make a request
}, 500)