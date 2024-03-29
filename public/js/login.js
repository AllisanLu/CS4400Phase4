let loginButton = document.getElementById("login")
let username = document.getElementById("username")
let password = document.getElementById("password")

function login(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `username=${username.value}&password=${password.value}`
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/attempt_login`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)
}

function responseHandler() {
    console.log("response");
    let message = document.getElementById("message")
    message.style.display = "block"
    if (this.response.success) {
        message.innerText = this.response.message;
        if (this.response.message == "admin") {
            window.location.href = "adminMenu";
        }
        else if (this.response.message == "manager") {
            window.location.href = "managerMenu";
        } else if (this.response.message == "manager&customer") {
            window.location.href = "rolechoice"
        }
        else {
            window.location.href = "customerMenu";
        }
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}

loginButton.addEventListener("click", login)