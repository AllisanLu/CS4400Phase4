let registerButton = document.getElementById("create")

let perID = document.getElementById("perID")
let password = document.getElementById("password")
let taxID = document.getElementById("taxID")
let firstname = document.getElementById("firstname")
let lastname = document.getElementById('lastname')
let bdate = document.getElementById("bdate")

let street = document.getElementById("street")
let city = document.getElementById("city")
let state = document.getElementById("state")
let zip = document.getElementById("zip")
let salary = document.getElementById("salary")
let payments = document.getElementById("num_payments")
let earnings = document.getElementById("earnings")


function addEmployee(event) {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    // TODO need to change
    query = `pid=${perID.value}&taxid=${taxID.value}&firstname=${firstname.value}&lastname=${lastname.value}&street=${street.value}&city=${city.value}&state=${state.value}&zip=${zip.value}
            &salary=${salary.value}&payments=${payments.value}&earnings=${earnings.value}&bdate=${bdate.value}&password=${password.value}`
    //console.log(query)
    // when submitting a GET request, the query string is appended to URL
    // but in a POST request, do not attach the query string to the url
    // instead pass it as a parameter in xhr.send()
    url = `/addEmployee`
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

registerButton.addEventListener("click", addEmployee)