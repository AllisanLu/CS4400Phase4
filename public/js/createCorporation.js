let registerButton = document.getElementById("create")
let cid = document.getElementById("id")
let longname = document.getElementById("long_name")
let shortname = document.getElementById("short_name")
let reserved = document.getElementById("reserved_assets")
let cancel = document.getElementById("cancel")

function addCorporation(event) {
    event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    query = `cid=${cid.value}&longname=${longname.value}&shortname=${shortname.value}&reserved=${reserved.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addCorporation`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // notice the query string is passed as a parameter in xhr.send()
    // this is to prevent the data from being easily sniffed
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
registerButton.addEventListener("click", addCorporation)