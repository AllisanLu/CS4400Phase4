let startOverdraft = document.getElementById("startOverdraft")
let stopOverdraft = document.getElementByID("stopOverdraft")
let checking_accountID = document.getElementById("checking_accountID")
let savings_accountID = document.getElementById("savings_accountID")

function startOverdraft(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    //No idea what to put here for this query
    //dont even know what any of this does
    query = `checking_accountID=${checking_accountID.value}&savings_accountID=${savings_accountID.value}`
    
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    
    url = `/manageOverdraft`
    xhr.responseType = "json";
    xhr.open("POST", url)
    
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    xhr.send(query)
}

function stopOverdraft(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    
    query = `checking_accountID=${checking_accountID.value}&savings_accountID=${savings_accountID.value}`
    
    url = `/manageOverdraft`
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
startOverdraft.addEventListener("click", startOverdraft)
stopOverdraft.addEventListener("click", stopOverdraft)
