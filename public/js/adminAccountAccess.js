let registerButton = document.getElementById("add")

let pID = document.getElementById("customer")
let account = document.getElementById("account")
let bank = document.getElementById("bank")
let type = document.getElementById("type")
let initbalance = document.getElementById("initbalance")
let interest = document.getElementById("interest")
let minbalance = document.getElementById("minbalance")
let maxwithdraws = document.getElementById("maxwithdraws")


function add(event) {
    console.log("waho!")
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `pid=${pID.value}&account=${account.value}&bank=${bank.value}&type=${type.value}
    &inibalance=${initbalance.value}&interest=${interest.value}&minbalance=${minbalance.value}&maxwithdraws=${maxwithdraws.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addNewAccount`
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
        window.location.href = "adminMenu";
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}

registerButton.addEventListener("click", add)