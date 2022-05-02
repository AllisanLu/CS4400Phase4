const express = require("express");
const { json } = require("express/lib/response");
const mysql = require("mysql2")
let authenticated = false;


let user = "";

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "astroslime123",
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
    authenticated = false;
    // we check for the username and password to match.
    connection.query("select pwd from person where perID = ?", [req.body.username], function (err, rows) {
        if (err || rows.length <= 0) {
            res.json({ success: false, message: "user doesn't exists" })
        } else {
            storedPassword = rows[0].pwd // rows is an array of objects e.g.: [ { password: '12345' } ]
            // bcrypt.compareSync let's us compare the plaintext password to the hashed password we stored in our database
            if (req.body.password === storedPassword) {
                user = rows[0].perID
                authenticated = true;
            } else {
                res.json({ success: false, message: "password is incorrect" })
            }
        }

        //checking to see if admin
        if (authenticated) {
            connection.query("select perID from system_admin where perID = ?", [req.body.username], function (err, rows) {
                if (!err && rows.length > 0) {
                    // res.redirect("/adminMenu")
                    res.json({ success: true, message: "admin" })
                } else {
                    connection.query("select perID from customer where perID = ?", [req.body.username], function (err, rows) {
                        if (!err) {
                            res.json({ success: true, message: "customer" })
                        } else {
                            res.json({ success: true, message: "logged in" })
                        }
                    })
                }
            })
        }
    })
})

/**
 * Admin Screen
 * Sends Admin.html displaying all actions avaiable to the admin
 */
app.get("/adminMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "Admin.html");
})

app.get("/manageUsers", function (req, res) {
    res.sendFile(__dirname + "/public/" + "manageUsers.html");
})

app.get("/customerMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "customerMenu.html");
})

/**
 *  Customer/Employee Role stuff
 */
app.get("/createEmployeeRole", function (req, res) {
    let call = 'select perID from customer'
    connection.query(call, [], function (err, result) {
        if (err) {
            res.json({ success: false, message: "could not load page" })
        } else {
            res.render(__dirname + "/public/" + "createEmployeeRole.ejs", { perIDs: result });
        }
    })
})

app.get("/createCustomerRole", function (req, res) {
    let call = 'select perID from employee'
    connection.query(call, [], function (err, result) {
        if (err) {
            res.json({ success: false, message: "could not load page" })
        } else {
            res.render(__dirname + "/public/" + "createCustomerRole.ejs", { perIDs: result });
        }
    })
})

app.post("/addEmployeeRoleFromCustomer", function (req, res) {
    console.log("adding employee")
    let call = 'call start_employee_role(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.pid, null, null, null, null, null, null, null, null, null, null, null, req.body.salary, req.body.payments, req.body.earned],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not add employee" })
                console.log("could not add employee")
            } else {
                res.json({ success: true, message: "added employee" })
                console.log("added employee")
            }
        }
    );
})

app.post("/addCustomerRoleFromEmployee", function (req, res) {
    let call = 'call start_customer_role(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.pid, null, null, null, null, null, null, null, null, null, null],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not add customer" })
                console.log("could not add customer")
            } else {
                res.json({ success: true, message: "added customer" })
                console.log("added customer")
            }
        }
    );
})

app.get("/removeCustomerRole", function (req, res) {
    let call = 'select perID from customer'
    connection.query(call, [], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.render(__dirname + "/public/" + "stopCustomerRole.ejs", { perIDs: result });
        }
    })
})

app.post("/stopCustomer", function (req, res) {
    let call = 'call stop_customer_role(?)';
    connection.query(call, [req.body.pid],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not remove role" })
                console.log("Could not remove role")
            } else {
                res.json({ success: true, message: "removed role" })
                console.log("removed role")
            }
        }
    );
})

app.get("/removeEmployeeRole", function (req, res) {
    let call = 'select perID from employee'
    connection.query(call, [], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.render(__dirname + "/public/" + "stopEmployeeRole.ejs", { perIDs: result });
        }
    })
})

app.post("/stopEmployee", function (req, res) {
    let call = 'call stop_employee_role(?)';
    connection.query(call, [req.body.pid],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not remove role" })
                console.log("Could not remove role")
            } else {
                res.json({ success: true, message: "removed role" })
                console.log("removed role")
            }
        }
    );
})




/**
 * View stats screen
 * Sends viewStats.html displaying all possible stats to view to the admin
 */
app.get("/viewStats", function (req, res) {
    res.sendFile(__dirname + "/public/" + "viewStats.html");
})

/**
 * Create Fee for interest bearing accounts
 */
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
}).post("/getAccounts", function (req, res) {
    let call = 'select accountID from interest_bearing where bankID = ?'
    connection.query(call, [req.body.bankID], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.json({ success: true, result: result })
        }
    });
}).post("/addFee", function (req, res) {
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


/**
 * Create Corporation
 * Sends createCorporation.html which allows admin to input:
 *  corporationID, short_name, long_name, and reserved_assets
 * and calls the create_corporation procedure with the values inputted
 */
app.get("/createCorporation", function (req, res) {
    res.sendFile(__dirname + "/public/" + "createCorporation.html");
}).post("/addCorporation", function (req, res) {
    console.log("adding corporation");
    let call = 'call create_corporation(?, ?, ?, ?)'
    connection.query(call, [req.body.cid, req.body.shortname, req.body.longname, req.body.reserved], function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not create corporation" })
        } else {
            res.json({ success: true, message: "Created corporation" })
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
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.render(__dirname + "/public/" + "createBank.ejs", { corpIDs: result1, employees: result2 })
            }
        })
    })
}).post("/addBank", function (req, res) {
    console.log("adding bank");
    let call = 'call create_bank(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.bid, req.body.name, req.body.street, req.body.city,
    req.body.state, req.body.zip, req.body.reserved, req.body.cid, req.body.manager, req.body.employee], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create bank" })
        } else {
            res.json({ success: true, message: "Created bank" })
        }
    });
});

/*
 * Manager Menu
 */
app.get("/managerMenu", function (req, res) {
    res.sendFile(__dirname + "/public/" + "Manager.html");
})

/**
 * Pays all employees in the system
 */
app.get("/payEmployees", function (req, res) {
    res.sendFile(__dirname + "/public/" + "payEmployees.html");
}).post("/payAllEmployees", function (req, res) {
    console.log("paying all employees");
    let call = 'call pay_employees()';
    connection.query(call, [], function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not pay employees" })
        } else {
            res.json({ sucess: true, message: "Employees paid" })
        }
    })
})


/**
 * Display Account Stats
 */
app.get("/displayAccountStats", function (req, res) {
    let call = 'select * from display_account_stats';
    connection.query(call, function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not display account stats" })
        } else {
            res.render(__dirname + "/public/" + "displayAccountStats.ejs", { accountStats: results })
        }
    })
});

/**
 * Display Bank Stats
 */

app.get("/displayBankStats", function (req, res) {
    let call = 'select * from display_bank_stats';
    connection.query(call, function(err, results) {
        if (err) {
            res.json({success: false, message: "Could not view bank stats"})
        } else {
            res.render(__dirname + "/public/" + "displayBankStats.ejs", { bankStats: results})

        }
    })
});

/**
 * View Corporation Stats
 */

app.get("/displayCorporationStats", function (req, res) {
    let call = 'select * from display_corporation_stats';
    connection.query(call, function (err, results) {
        console.log(err);
        if (err) {
            res.json({success: false, message: "Could not display corporation stats"})
        } else {
            res.render(__dirname + "/public/" + "displayCorporationStats.ejs", { corporationStats: results})
        }
    })
});

/**
 * View Customer Stats
 */


app.get("/displayCustomerStats", function (req, res) {
    console.log("viewing customer stats");
    let call = 'select * from display_customer_stats';
    connection.query(call, function (err, results) {
        if (err) {
            res.json({success: false, message: "Could not view customer stats"})
        } else {
            res.render(__dirname + "/public/" + "displayCustomerStats.ejs" , { customerStats: results})
        }
    })
});

/**
 * View Employee Stats
 */

app.get("/displayEmployeeStats", function (req, res) {
    console.log("viewing employee stats");
    let call = 'select * from display_employee_stats';
    connection.query(call, function (err, results) {
        if (err) {
            res.json({success: false, message: "Could not view account stats"})
        } else {
            res.render(__dirname + "/public/" + "displayEmployeeStats.ejs", { employeeStats: results})
        }
    })
});

app.listen(3000, function () {
    console.log("Listening on port 3000...");
});


