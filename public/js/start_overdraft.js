let connector = document.getElementById("Start Overdraft")
let checkingAccount = document.getElementById("Checking")
let savingAccount = document.getElementById("Saving")

function startOverdraft(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    //No idea what to put here for this query
    //dont even know what any of this does
    query = `pid=${pid.value}`
    
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
        window.location.href = "manageUsers";
    } else {
        console.log(this.response.success)
        message.innerText = this.response.message
    }
}
registerButton.addEventListener("click", startOverdraft)
