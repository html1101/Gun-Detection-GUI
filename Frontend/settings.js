const user = {
    firstName: "Sarah",
    lastName: "Cross",
    phone: "210-765-4321",
    email: "sc@scifair.com"
 };
 
 
 document.getElementById("user_info").innerHTML = `
 ${user["firstName"]} ${user["lastName"]}
 <br>
 ${user["phone"]}
 <br>
 ${user["email"]}
 `;


var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value * 100;

slider.oninput = function() {
  output.innerHTML = Math.round(this.value * 100);

  // Change threshold value to this new value.
  window.api.send("setThreshold", this.value);
}

// Get confidence score stored using IPC from Electron (see preload.js and backend.js)
window.api.send("getThreshold");
window.api.receive("thresholdValue", (value) => {
  // Now that we have true value, replace slider's value with this.
  slider.value = value;
  slider.oninput();
})