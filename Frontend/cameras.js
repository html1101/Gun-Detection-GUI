let cameras = [
    {
        "camera_view": "Insert view",
        "camera_name": "Hello there!",
        "location": "Office",
        "connection_type": "webcam"
    },
    {
        "camera_view": "Insert view",
        "camera_name": "Sarah",
        "location": "Porch",
        "connection_type": "rtsp"
    }
];

for(let i = 0; i < cameras.length; i++) {
    let create_element = document.createElement("tr");

    create_element.className = "camera";

    create_element.style="height:75px";

    create_element.innerHTML = `
    <td>${cameras[i]["camera_view"]}</td>
    <td>${cameras[i]["camera_name"]}</td>
    <td>${cameras[i]["location"]}</td>
    <td>${cameras[i]["connection_type"]}</td>
    `;

    document.querySelector("#table").appendChild(create_element);
}