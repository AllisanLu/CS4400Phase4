let registerButton = document.getElementById("create")
let bank = document.getElementById("bank")
let account = document.getElementById("account")
let type = document.getElementById("type")

function createFee(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `bank=${bank.value}&account=${account.value}&type=${type.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addFee`
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
        window.location.href = "index";
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}

function updateAccounts(event) {
    while (account.firstChild) {
        account.removeChild(account.firstChild);
    }
    //make another xml call lol
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", function () {
        if (this.response.success) {
            let accounts = this.response.result
            for (var i = 0; i < accounts.length; i++) {
                var o = document.createElement("option");
                o.value = accounts[i].accountID;
                o.text = accounts[i].accountID;
                account.appendChild(o);
            }
        } else {
            console.log(this.response)
        }
    })
    query = `bankID=${bank.value}`
    url = `/getAccounts`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)
}

registerButton.addEventListener("click", createFee)
bank.addEventListener("change", updateAccounts)