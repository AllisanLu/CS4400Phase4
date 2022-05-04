let stopButton = document.getElementById("stop")
let startButton = document.getElementById("start")
let checkingbank = document.getElementById("checkingbank")
let checkingaccount = document.getElementById("checkingaccount")
let savingsbank = document.getElementById("savingsbank")
let savingsaccount = document.getElementById("savingsaccount")

function stopOverdraft(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `checkingbank=${checkingbank.value}&checkingaccount=${checkingaccount.value}&savingsbank=${savingsbank.value}&savingsaccount=${savingsaccount.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/stopOverdraft`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)
}

function startOverdraft(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `checkingbank=${checkingbank.value}&checkingaccount=${checkingaccount.value}&savingsbank=${savingsbank.value}&savingsaccount=${savingsaccount.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/startOverdraft`
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
        if (this.response.admin) {
            window.location.href = "adminMenu";
        } else {
            window.location.href = "customerMenu";
        }
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}

function updateCheckingAccount(event) {
    while (checkingaccount.firstChild) {
        checkingaccount.removeChild(checkingaccount.firstChild);
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
                checkingaccount.appendChild(o);
            }
        } else {
            console.log(this.response)
        }
    })
    query1 = `bankID=${checkingbank.value}`
    url1 = `/getCheckingAccount`
   // url2 = `/getAccount2`
    xhr1.responseType = "json";
    xhr1.open("POST", url1)
   // xhr.open("POST", url2)
    xhr1.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr1.send(query1)
}

function updateSavingsAccount(event) {

    while (savingsaccount.firstChild) {
        savingsaccount.removeChild(savingsaccount.firstChild);
    }


    let xhr2 = new XMLHttpRequest
    xhr2.addEventListener("load", function () {
        if (this.response.success) {
            let accounts = this.response.result
            for (var i = 0; i < accounts.length; i++) {
                var o = document.createElement("option");
                o.value = accounts[i].accountID;
                o.text = accounts[i].accountID;
                savingsaccount.appendChild(o);
            }
        } else {
            console.log(this.response)
        }
    })
    query2 = `bankID=${savingsbank.value}`
    //console.log(savingsbank.value)
    url2 = `/getSavingsAccount`
   // url2 = `/getAccount2`
    xhr2.responseType = "json";
    xhr2.open("POST", url2)
   // xhr.open("POST", url2)
    xhr2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr2.send(query2)
}

stopButton.addEventListener("click", stopOverdraft)
startButton.addEventListener("click", startOverdraft)

checkingbank.addEventListener("change", updateCheckingAccount) 
savingsbank.addEventListener("change", updateSavingsAccount)