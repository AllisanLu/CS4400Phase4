let connector = document.getElementById("Start Overdraft")
let checkingAccount = document.getElementById("Checking")
let savingAccount = document.getElementById("Saving")

function startOverdraft(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    //No idea what to put here for this query
    //dont even know what any of this does
    query = `checkingAccount=${checkingAccount.value}&savingAccount=${savingAccount.value}`
    
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    
    url = `/startingOverdraft`
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
            window.location.href = "adminMenu"; //update this to change whether its admin or manager ;v;
        } else {
            window.location.href = "customerMenu";
        }
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}
connector.addEventListener("click", startOverdraft)
