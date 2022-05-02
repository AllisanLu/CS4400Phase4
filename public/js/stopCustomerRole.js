let registerButton = document.getElementById("create")
let pid = document.getElementById("pid")

function removeCustomer(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `pid=${pid.value}`
    url = `/stopCustomer`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
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
registerButton.addEventListener("click", removeCustomer)