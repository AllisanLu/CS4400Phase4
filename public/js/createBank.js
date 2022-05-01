let registerButton = document.getElementById("create")
let bid = document.getElementById("bid")
let bankName = document.getElementById("bname")
let street = document.getElementById("street")
let city = document.getElementById("city")
let state = document.getElementById("state")
let zip = document.getElementById("zip")
let reserved = document.getElementById("reserved_assets")
let manager = document.getElementById("manager")
let cid = document.getElementById("cid")
let employee = document.getElementById("employee")

function addBank(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    // TODO need to change
    query = `bid=${bid.value}&name=${bankName.value}&street=${street.value}&city=${city.value}&state=${state.value}&zip=${zip.value}&reserved=${reserved.value}
            &manager=${manager.value}&cid=${cid.value}&employee=${employee.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addBank`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)

    // Redirect back to admin menu
    window.location.href='/adminMenu'
}

function responseHandler() {
    let message = document.getElementById("message")
    message.style.display = "block"
    if (this.response.success) {
        message.innerText = this.response.message;
        window.location.href = "index";
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}

registerButton.addEventListener("click", addBank)