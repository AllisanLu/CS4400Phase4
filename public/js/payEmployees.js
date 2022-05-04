let pay = document.getElementById("pay")
let cancel = document.getElementById("cancel")

function payEmployees(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = ''
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/payAllEmployees`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.send(query)
}

function responseHandler() {
    console.log("wahoo")
    let message = document.getElementById("message")
    message.style.display = "block"
    if (this.response.success) {
        message.innerText = this.response.message;
        if (this.response.admin) {
            window.location.href = "adminMenu"
        } else {
            window.location.href = "managerMenu";
        }
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}
pay.addEventListener("click", payEmployees)