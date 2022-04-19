const express = require("express");
const { json } = require("express/lib/response");
const mysql = require("mysql2")
let authenticated = false;

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
app.use(express.urlencoded({ extended: false }));

//login stuff
// post to route "attempt login"
app.post("/attempt_login", function (req, res) {
    // we check for the username and password to match.
    connection.query("select pwd from person where perID = ?", [req.body.username], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "user doesn't exists" });
        } else {
            storedPassword = rows[0].pwd // rows is an array of objects e.g.: [ { password: '12345' } ]
            // bcrypt.compareSync let's us compare the plaintext password to the hashed password we stored in our database
            if (req.body.password === storedPassword) {
                authenticated = true;
            } else {
                res.json({ success: false, message: "password is incorrect" })
            }
        }

        //checking to see if admin
        if (authenticated) {
            connection.query("select perID from system_admin where perID = ?", [req.body.username], function (err, rows) {
                if (!err) {
                    res.redirect("/adminMenu")
                } else {
                    res.json({ success: true, message: "logged in" })
                }
            })
        }
    })
})

//admin screen stuff
app.get("/adminMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "Admin.html");
})


//corporation stuff
app.get("/createCorporation", function (req, res) {
    res.sendFile(__dirname + "/public/" + "createCorporation.html");
})

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