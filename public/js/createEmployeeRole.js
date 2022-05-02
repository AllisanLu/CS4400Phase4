let registerButton = document.getElementById("create")
let pid = document.getElementById("pid")
let salary = document.getElementById("salary")
let payments = document.getElementById("num_payments")
let earnings = document.getElementById("earnings")

console.log("pls")
function addEmployee(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `pid=${pid.value}&salary=${salary.value}&payments=${payments}&earned=${earnings}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addEmployeeRoleFromCustomer`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)
}

function responseHandler() {
    let message = document.getElementById("message")
    message.style.display = "block"
    if (this.response.success) {
        message.innerText = this.response.message;
        window.location.href = "manageUsers";
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}
registerButton.addEventListener("click", addEmployee)