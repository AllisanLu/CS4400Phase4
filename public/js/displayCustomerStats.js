function createTable() {
    let stats = JSON.parse(customerStats)
    var cols = [];

    for (var i = 0; i < stats.length; i++) {
        for (var k in stats[i]) {
            if (cols.indexOf(k) === -1) {
                cols.push(k);
            }
        }
    }
     
    // Create a table element
    var table = document.createElement("table");
     
    // Create table row tr element of a table
    var tr = table.insertRow(-1);
     
    for (var i = 0; i < cols.length; i++) {
         
        // Create the table header th element
        var theader = document.createElement("th");
        theader.innerHTML = cols[i];
         
        // Append columnName to the table row
        tr.appendChild(theader);
    }
     
    // Adding the data to the table
    for (var i = 0; i < stats.length; i++) {  
        // Create a new row
        trow = table.insertRow(-1);
        for (var j = 0; j < cols.length; j++) {
            var cell = trow.insertCell(-1);
             
            // Inserting the cell at particular place
            cell.innerHTML = stats[i][cols[j]];
        }
    }
     
    // Add the newly created table containing json data
    var el = document.getElementById("table");
    el.innerHTML = "";
    el.appendChild(table);
}   

function loadTable() {
    //event.preventDefault()
    let xhr = new XMLHttpRequest
    xhr.addEventListener("load", responseHandler)
    url = `/displayCustomerStats`
    xhr.responseType = "json";
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.send()
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

window.onload = function() {
    createTable();
}