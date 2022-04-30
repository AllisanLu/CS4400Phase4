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


/**
 * Login screen
 * Posts to /attempt_login
 * Sees if entered user exists then if they exist, check the password, autheticating the user
 * If the user was sucessfully authenticated, check whether user is an admin
 */
app.post("/attempt_login", function (req, res) {
    // we check for the username and password to match.
    connection.query("select pwd from person where perID = ?", [req.body.username], function (err, rows) {
        if (err || rows.length <= 0) {
            res.json({ success: false, message: "user doesn't exists" })
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
                   // res.redirect("/adminMenu")
                    res.json({ success: true, message: "admin" })
                } else {
                    res.json({ success: true, message: "logged in" })
                }
            })
        }
    })
})

/**
 * Admin Screen
 * Sends Admin.html displaying all options avaiable to the admin
 */
app.get("/adminMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "Admin.html");
})


/**
 * Create Corporation
 * Sends createCorporation.html which allows admin to input:
 *  corporationID, short_name, long_name, and reserved_assets
 * and calls the create_corporation procedure with the values inputted
 */
app.get("/createCorporation", function (req, res) {
    res.sendFile(__dirname + "/public/" + "createCorporation.html");
})

app.post("/addCorporation", function (req, res) {
    console.log("adding corporation");
    let call = 'call create_corporation(?, ?, ?, ?)'
    connection.query(call, [req.body.cid, req.body.shortname, req.body.longname, req.body.reserved], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create corporation" })
        }
    });
})

/**
 * Create Bank
 * Renders createBank.ejs which allows us to populate the dropdown menu with the queries found in the GET request
 * Takes in the parameters:
 *  bankID, bank_name, street, city, state, zip, reserved_assets, corporationID, manager, and employee
 * and calls create_bank with values inputted
 */
app.get("/createBank", function (req, res) {
    let call = 'select corpID from corporation'
    let call2 = 'select perID from employee where perID not in (select manager from bank)'
    connection.query(call, [], function(err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.render(__dirname + "/public/" + "createBank.ejs", { corpIDs: result1, employees: result2 })
            }
        })
    })
});

app.post("/addBank", function (req, res) {
    console.log("adding bank");
    let call = 'call create_bank(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.bid, req.body.name, req.body.street, req.body.city,
                            req.body.state, req.body.zip, req.body.reserved, req.body.cid, req.body.manager, req.body.employee], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create bank" })
        }
    });
});

/**
 * Pay Employees
 */
app.get("/payEmployees", function (req, res) {
    res.sendFile(__dirname + "/public/" + "payEmployees.html");
})

app.post("/payAllEmployees", function (req, res) {
    console.log("paying all employees");
    let call = 'call pay_employees()';
    connection.query(call, [], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create corporation" })
        }
    });
})

app.listen(3000, function () {
    console.log("Listening on port 3000...");
});

[]