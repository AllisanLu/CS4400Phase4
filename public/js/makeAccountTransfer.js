let registerButton = document.getElementById("transfer")
let bank1 = document.getElementById("bank1")
let account1 = document.getElementById("account1")
let bank2 = document.getElementById("bank2")
let account2 = document.getElementById("account2")
let amount = document.getElementById("amount")

function makeAccountTransfer(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `amount=${amount.value}&bank1=${bank1.value}&account1=${account1.value}&bank2=${bank2.value}&account2=${account2.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/makeTransfer`
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

function updateAccount1(event) {
    while (account1.firstChild) {
        account1.removeChild(account1.firstChild);
    }

    //make another xml call lol
    let xhr1 = new XMLHttpRequest
    xhr1.addEventListener("load", function () {
        if (this.response.success) {
            let accounts = this.response.result
            for (var i = 0; i < accounts.length; i++) {
                var o = document.createElement("option");
                o.value = accounts[i].accountID;
                o.text = accounts[i].accountID;
                account1.appendChild(o);
            }
        } else {
            console.log(this.response)
        }
    })
    query1 = `bankID=${bank1.value}`
    url1 = `/getAccount1`
   // url2 = `/getAccount2`
    xhr1.responseType = "json";
    xhr1.open("POST", url1)
   // xhr.open("POST", url2)
    xhr1.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr1.send(query1)
}


function updateAccount2(event) {

    while (account2.firstChild) {
        account2.removeChild(account2.firstChild);
    }


    let xhr2 = new XMLHttpRequest
    xhr2.addEventListener("load", function () {
        if (this.response.success) {
            let accounts = this.response.result
            for (var i = 0; i < accounts.length; i++) {
                var o = document.createElement("option");
                o.value = accounts[i].accountID;
                o.text = accounts[i].accountID;
                account2.appendChild(o);
            }
        } else {
            console.log(this.response)
        }
    })
    query2 = `bankID=${bank2.value}`
    url2 = `/getAccount2`
   // url2 = `/getAccount2`
    xhr2.responseType = "json";
    xhr2.open("POST", url1)
   // xhr.open("POST", url2)
    xhr2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr2.send(query2)
}

registerButton.addEventListener("click", makeAccountTransfer)
bank1.addEventListener("change", updateAccount1) 
bank2.addEventListener("change", updateAccount2)