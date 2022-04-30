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

//admin screen stuff
app.get("/adminMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "Admin.html");
})

app.get("/createFee", function (req, res) {
    let call = 'select bankID from bank'
    let call2 = 'select bankID, accountID from bank_account'
    connection.query(call, [], function (err, result1) {
        // AHHHH gotta make it like async????
        //or I can make a 2d array or map or something
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.render(__dirname + "/public/" + "createFee.ejs", { banks: result1, accounts: result2 })
            }
        })
    })
});

app.post("/getAccounts", function (req, res) {
    let call = 'select accountID from bank_account where bankID = ?'
    connection.query(call, [req.body.bankID], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.json({ success: true, result: result })
        }
    });
})

app.post("/addFee", function (req, res) {
    console.log("adding fee");
    let call = 'call create_fee(?, ?, ?)';
    connection.query(call, [req.body.bank, req.body.account, req.body.type], function (err, rows) {
        if (err) {
            console.log(err)
            res.json({ success: false, message: "Could not create fee" })
            console.log("could not add fee")
        } else {
            res.json({ success: true, message: "added fee" })
            console.log("added fee")
        }
    });
});


//corporation stuff
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

//bank stuff
// https://stackoverflow.com/questions/64145576/populate-html-dropdownlist-with-fetched-mysql-data-using-node-js-express-js
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

// var select = document.getElementById('language');
// var value = select.options[select.selectedIndex].value;
// console.log(value); // en


app.post("/addBank", function (req, res) {
    console.log("adding bank");
    let call = 'call create_bank(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.bid, req.body.name, req.body.street, req.body.city,
                            req.body.state, req.body.zip, req.body.reserved, req.body.cid, req.body.manager, req.body.employee], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create bank" })
        }
        console.log(rows)
    });
});


app.listen(3000, function () {
    console.log("Listening on port 3000...");
});

[]