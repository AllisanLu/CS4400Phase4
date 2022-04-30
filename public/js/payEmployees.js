let pay = document.getElementById("pay")

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
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
    console.log("test")
    xhr.send(query)
}

function responseHandler() {
    //let message = document.getElementById("message")
   // message.style.display = "block"
//send to next page here
    if (this.response.success) {
        console.log(this.response.message);
    } else {
        console.log(this.response.success)
      //  message.innerText = this.response.message
    }
}

pay.addEventListener("click", payEmployees)