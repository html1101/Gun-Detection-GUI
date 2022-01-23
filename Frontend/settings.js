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
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}