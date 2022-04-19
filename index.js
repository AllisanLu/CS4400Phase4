const express = require("express");
const { json } = require("express/lib/response");
const mysql = require("mysql2")

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Wahaha!!",
    database: "bank_management"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error connecting to MySQL", err);
    } else {
        console.log("Connection established");
    }
});

const app = express();
app.use(express.static("public"));

app.get("/createCorporation", function (req, res) {
    res.sendFile(__dirname + "/public/" + "createCorporation.html");
})

app.use(express.urlencoded({ extended: false }));

app.post("/addCorporation", function (req, res) {
    console.log("adding corporation");
    let call = 'call create_corporation(?, ?, ?, ?)'
    connection.query(call, [req.body.cid, req.body.shortname, req.body.longname, req.body.reserved], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "server error" })
        }
    });
})


app.listen(3000, function () {
    console.log("Listening on port 3000...");
});