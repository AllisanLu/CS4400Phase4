const express = require("express");
const { json } = require("express/lib/response");
const mysql = require("mysql2")
let authenticated = false;
let admin = false;
let manager = false;

let user = "";

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
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
app.get("/logout", function (req, res) {
    authenticated = false;
    admin = false;
    manager = false;
    user = "";
    res.sendFile(__dirname + "/public/" + "index.html");
})

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
                user = req.body.username
                authenticated = true;

            } else {
                res.json({ success: false, message: "password is incorrect" })
            }
        }

        //checking to see if admin
        if (authenticated) {
            connection.query("select perID from system_admin where perID = ?", [req.body.username], function (err, rows) {
                if (!err && rows.length > 0) {
                    admin = true;
                    res.json({ success: true, message: "admin" })
                } else {
                    //check to see if manager
                    connection.query("select manager from bank where manager = ?", [req.body.username], function (err, rows) {
                        if (!err && rows.length > 0) {
                            manager = true;
                            connection.query("select perID from customer where perID = ?", [req.body.username], function (err, rows) {
                                if (!err && rows.length > 0) {
                                    res.json({success: true, message: "manager&customer"})
                                } else {
                                    res.json({ success: true, message: "manager" })
                                }
                            })
                        } else {
                            res.json({ success: true, message: "customer" })
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

app.get("/rolechoice", function (req, res) {
    res.sendFile(__dirname + "/public/" + "rolechoice.html");
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
    let call = 'select perID from customer where perID not in (select perID from employee)'
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
    connection.query(call, [req.body.pid, null, null, null, null, null, null, null, null, null, req.body.salary, req.body.payments, req.body.earned, null],
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

/*
 * Hire worker
 */
app.get("/hireWorker", function (req, res) {
    let call = 'select bankID from bank'
    let call2 = 'select perID from employee where perID not in (select manager from bank)'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "server error" })
            } else {
                res.render(__dirname + "/public/" + "hireWorker.ejs", { banks: result1, perIDs: result2, admin: admin })
            }
        })
    })
})
app.post("/hire", function (req, res) {
    let call = 'call hire_worker(?, ?, ?)';
    connection.query(call, [req.body.pid, req.body.bank, req.body.salary],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not hire worker" })
                console.log("Could not hire worker")
            } else {
                res.json({ success: true, message: "Hired Worker", admin: admin })
                console.log("Hired Worker")
            }
        }
    );
})

/**
 * Replace Manager
 */
app.get("/replaceManager", function (req, res) {
    let call = 'select bankID from bank'
    let call2 = 'select perID from employee'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "server error" })
            } else {
                res.render(__dirname + "/public/" + "replaceManager.ejs", { banks: result1, perIDs: result2 })
            }
        })
    })
})
app.post("/replace", function (req, res) {
    let call = 'call replace_manager(?, ?, ?)';
    connection.query(call, [req.body.pid, req.body.bank, req.body.salary],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not replace manager" })
                console.log("Could not replace manager")
            } else {
                res.json({ success: true, message: "Replaced Manager", admin: admin })
                console.log("replaced manager")
            }
        }
    );
})

/*
 * Deposit and withdraw
 */
app.get("/depositPage", function (req, res) {
    let call = 'select bankID from bank'
    let call2 = 'select bankID, accountID from bank_account'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "server error" })
            } else {
                res.render(__dirname + "/public/" + "deposit.ejs", { banks: result1, accounts: result2 })
            }
        })
    })
}).post("/getAccounts", function (req, res) {
    let call = 'select accountID from access where bankID = ? and perID = ?'
    connection.query(call, [req.body.bankID, user], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.json({ success: true, result: result })
        }
    });
})
app.post("/deposit", function (req, res) {
    let call = 'call account_deposit(?, ?, ?, ?, ?)';
    connection.query(call, [user, req.body.amount, req.body.bank, req.body.account, null],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not deposit" })
                console.log("Could not deposit")
            } else {
                res.json({ success: true, message: "Deposited" })
                console.log("Deposited")
            }
        }
    );
})

app.get("/withdrawPage", function (req, res) {
    let call = 'select bankID from bank'
    let call2 = 'select bankID, accountID from bank_account'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "server error" })
            } else {
                res.render(__dirname + "/public/" + "withdrawl.ejs", { banks: result1, accounts: result2 })
            }
        })
    })
}).post("/getAccounts", function (req, res) {
    let call = 'select accountID from access where bankID = ? and perID = ?'
    connection.query(call, [req.body.bankID, user], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.json({ success: true, result: result })
        }
    });
})
app.post("/withdraw", function (req, res) {
    let call = 'call account_withdrawal(?, ?, ?, ?, ?)';
    connection.query(call, [user, req.body.amount, req.body.bank, req.body.account, null],
        function (err, rows) {
            if (err) {
                console.log(err)
                res.json({ success: false, message: "Could not withdraw" })
                console.log("Could not withdraw")
            } else {
                res.json({ success: true, message: "Withdrawled" })
                console.log("withdrawled")
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
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.render(__dirname + "/public/" + "createFee.ejs", { banks: result1, accounts: result2 })
            }
        })
    })
}).post("/getInterestAccounts", function (req, res) {
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
    let call3 = 'select perID from employee where perID not in (select manager from bank) and perID not in (select perID from workfor)'
    let call2 = 'select perID from employee where perID not in (select manager from bank)'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            connection.query(call3, [], function (err, result3) {
                if (err) {
                    res.json({ success: false, message: "" })
                } else {
                    res.render(__dirname + "/public/" + "createBank.ejs", { corpIDs: result1, employees: result2, managers: result3 })
                }
            })
        })
    })
}).post("/addBank", function (req, res) {
    console.log("adding bank");
    let call = 'call create_bank(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(call, [req.body.bid, req.body.name, req.body.street, req.body.city,
    req.body.state, req.body.zip, req.body.reserved, req.body.cid, req.body.manager, req.body.employee], function (err, rows) {
        if (err) {
            res.json({ success: false, message: "Could not create bank" })
            console.log("could not create bank")
        } else {
            res.json({ success: true, message: "Created bank" })
            console.log("created bank")
        }
    });
});

/**
 * Manage Overdraft
 * Sends manageOverdraft.ejs which allows admin/accessor to select:
 * checking_bankID, checking_accountID, savings_bankID, and savings_accountID
 * and calls the manageOverdraft procedure with the values selected
 */
app.get("/manageOverdraft", function (req, res) {
    let call1 = null
    let call2 = null
    let call3 = null
    let call4 = null
    console.log("enter1")

    if (admin) {
        // call = 'select bankID from bank'
        // call2 = 'select bankID, accountID from bank_account'
        // call3 = 'select bankID as bid from bank'
        // call4 = 'select bankID as bid, accountID as aid from bank_account'
        call1 = 'select bankID from bank'
        call2 = 'select bankID, accountID from checking'
        call3 = 'select bankID from bank'
        call4 = 'select bankID, accountID from savings'
        connection.query(call1, [], function (err, result1) {
            connection.query(call2, [], function (err, result2) {
                connection.query(call3, [], function (err, result3) {
                    connection.query(call4, [], function (err, result4) {
                        if (err) {
                            res.json({ success: false, message: "" })
                        } else {
                            res.render(__dirname + "/public/" + "manageOverdraft.ejs", { checkingbanks: result1, checkingaccounts: result2, savingsbanks: result3, savingsaccounts: result4, admin: admin })
                        }
                    })
                })
                
            })
        })
    } else {
        call1 = 'select bankID from bank where bankID in (select bankID from access where perID=?)'
        call2 = 'select bankID, accountID from checking where accountID in (select accountID from access where perID=?)'
        call3 = 'select bankID from bank where bankID in (select bankID from access where perID=?)'
        call4 = 'select bankID, accountID from savings where accountID in (select accountID from access where perID=?)'
        connection.query(call1, [user], function (err, result1) {
            connection.query(call2, [user], function (err, result2) {
                connection.query(call3, [user], function (err, result3) {
                    connection.query(call4, [user], function (err, result4) {
                        if (err) {
                            res.json({ success: false, message: "" })
                        } else {
                            res.render(__dirname + "/public/" + "manageOverdraft.ejs", { checkingbanks: result1, checkingaccounts: result2, savingsbanks: result3, savingsaccounts: result4, admin: admin })
                        }
                    })
                })
                
            })
        })
    }

}).post("/getCheckingAccount", function (req, res) {
    console.log("enter2")
    let call = null
    if (admin) {
        call = 'select accountID from checking where bankID = ?'
        connection.query(call, [req.body.bankID], function (err, result) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                console.log(call)
                res.json({ success: true, result: result })
                
            }
        });
    } else {
        call = 'select accountID from checking where bankID = ? and bankID in (select bankID from access where perID=?)'
        connection.query(call, [req.body.bankID, user], function (err, result) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        });
    }

}).post("/getSavingsAccount", function (req, res) {
    console.log("enter3")
    let call = null
    console.log([req.body.bankID])
    if (admin) {
        call = 'select accountID from savings where bankID = ?'
        connection.query(call, [req.body.bankID], function (err, result) {
            console.log([req.body.bankID])

            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        });
    } else {
      //call = 'select accountID from bank_account where bankID = ? and bankID in (select bankID from access where perID=?)'

        call = 'select accountID from savings where bankID = ? and accountID in (select accountID from access where perID=?)'
        connection.query(call, [req.body.bankID, user], function (err, result) {
            console.log([req.body.bankID])
            console.log(user)

            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        });
    }

}).post("/startOverdraft", function (req, res) {
    console.log("Starting Overdraft");
    let call = 'call start_overdraft(?, ?, ?, ?, ?)'
    connection.query(call, [user, req.body.checkingbank, req.body.checkingaccount, req.body.savingsbank, req.body.savingsaccount], function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not link accounts" })
        } else {
            res.json({ success: true, message: "Started Overdraft Protection", admin: admin })
        }
    });
}).post("/stopOverdraft", function (req, res) {
    console.log("Stopping Overdraft");
    let call = 'call stop_overdraft(?, ?, ?)'
    connection.query(call, [user, req.body.checkingbank, req.body.checkingaccount], function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not link accounts" })
        } else {
            res.json({ success: true, message: "Started Overdraft Protection", admin: admin })
        }
    });
});

/**
 * Transfer funds between accounts
 */
 app.get("/makeAccountTransfer", function (req, res) {
     console.log("here1")
     let call = null
     let call2 = null
     let call3 = null
     let call4 = null
    if (admin) {
        call = 'select bankID from bank'
        call2 = 'select bankID, accountID from bank_account'
        call3 = 'select bankID as bid from bank'
        call4 = 'select bankID as bid, accountID as aid from bank_account'
        connection.query(call, [], function (err, result1) {
            connection.query(call2, [], function (err, result2) {
                connection.query(call3, [], function (err, result3) {
                    connection.query(call4, [], function (err, result4) {
                        if (err) {
                            res.json({ success: false, message: "" })
                        } else {
                            res.render(__dirname + "/public/" + "makeAccountTransfer.ejs", { frombanks: result1, fromaccounts: result2, tobanks: result3, toaccounts: result4 })
                        }
                    })
                })
                
            })
        })
    } else { 
        // let call1 = 'select accountID from checking where accountID in (select accountID from access where perID=?)'
        // let call2 = 'select accountID from savings where accountID in (select accountID from access where perID=?)'
        call = 'select bankID from bank where bankID in (select bankID from access where perID=?)'
        call2 = 'select bankID, accountID from bank_account where accountID in (select accountID from access where perID=?)'
        call3 = 'select bankID as bid from bank where bankID in (select bankID from access where perID=?)'
        call4 = 'select bankID as bid, accountID as aid from bank_account where accountID in (select accountID from access where perID=?)'
        connection.query(call, [user], function (err, result1) {
            connection.query(call2, [user], function (err, result2) {
                connection.query(call3, [user], function (err, result3) {
                    connection.query(call4, [user], function (err, result4) {
                        if (err) {
                            res.json({ success: false, message: "" })
                        } else {
                            res.render(__dirname + "/public/" + "makeAccountTransfer.ejs", { frombanks: result1, fromaccounts: result2, tobanks: result3, toaccounts: result4 })
                        }
                    })
                })
                
            })
        })
    }


}).post("/getAccount1", function (req, res) {
    console.log("here2")
    let call = null
    if (admin) {
        call = 'select accountID from bank_account where bankID = ?'
        connection.query(call, [req.body.bankID], function (err, result) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        });
    } else {
        call = 'select accountID from bank_account where bankID = ? and bankID in (select bankID from access where perID=?)'
        connection.query(call, [req.body.bankID, user], function (err, result) {
            console.log(user)
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        });
    }

}).post("/getAccount2", function (req, res) {
    console.log("here3")

    let call = null;
    if (admin) {
        call = 'select accountID from bank_account where bankID = ?'
        connection.query(call, [req.body.bankID], function (err, result) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        })
    } else {
        call = 'select accountID from bank_account where bankID = ? and bankID in (select bankID from access where perID=?)'
        connection.query(call, [req.body.bankID, user], function (err, result) {
            if (err) {
                res.json({ success: false, message: "" })
            } else {
                res.json({ success: true, result: result })
            }
        })
    }

}).post("/makeTransfer", function (req, res) {
    console.log("maketransfer");
    let call = 'call account_transfer(?, ?, ?, ?, ?, ?, ?)';
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var date = yyyy + "-" + mm + "-" + dd;

    connection.query(call, [user, req.body.amount, req.body.bank1, req.body.account1, req.body.bank2, req.body.account2, date], function (err, rows) {
        if (err) {
            console.log(err)
            res.json({ success: false, message: "Could not transfer" })
            console.log("could not transfer")
        } else {
            console.log(call)

            res.json({ success: true, message: "Transfer success" })
            console.log("Transfer succeeded")
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
    res.render(__dirname + "/public/" + "payEmployees.ejs", {admin: admin});
}).post("/payAllEmployees", function (req, res) {
    console.log("paying all employees");
    let call = 'call pay_employees()';
    connection.query(call, [], function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not pay employees" })
        } else {
            res.json({ success: true, message: "Employees paid", admin: admin })
            console.log("employees paid")
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
    connection.query(call, function (err, results) {
        if (err) {
            res.json({ success: false, message: "Could not view bank stats" })
        } else {
            res.render(__dirname + "/public/" + "displayBankStats.ejs", { bankStats: results })

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
            res.json({ success: false, message: "Could not display corporation stats" })
        } else {
            res.render(__dirname + "/public/" + "displayCorporationStats.ejs", { corporationStats: results })
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
            res.json({ success: false, message: "Could not view customer stats" })
        } else {
            res.render(__dirname + "/public/" + "displayCustomerStats.ejs", { customerStats: results })
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
            res.json({ success: false, message: "Could not view account stats" })
        } else {
            res.render(__dirname + "/public/" + "displayEmployeeStats.ejs", { employeeStats: results })
        }
    })
});

/*
 * Manage account access stuff
 */
app.get("/customerAccountAccess", function (req, res) {
    let adminView = 'select bankID from bank'
    let customerView = 'select distinct bank.bankID from bank join access where bank.bankID = access.bankID and access.perID = ?;'
    let call = (admin) ? adminView : customerView
    let call2 = 'select perID from customer'

    connection.query(call, [user], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            if (err) {
                res.json({ success: false, message: ""})
            } else {
                res.render(__dirname + "/public/" + "customerAccountAccess.ejs", {banks: result1, accounts: [], customers: result2, admin: admin })
            }
        })
    });
}).post("/getCustomerAccounts", function (req, res) {
    let call = 'select distinct accountID from access where bankID = ? and perID = ?'
    if (admin) {
        call = 'select distinct accountID from access where bankID = ?'
    }
    connection.query(call, [req.body.bankID, user], function (err, result) {
        if (err) {
            res.json({ success: false, message: "" })
        } else {
            res.json({ success: true, result: result })
        }
    });
}).post("/addAccountAccess", function (req, res) {
    let call = 'call add_account_access(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)'

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    var date = yyyy + "-" + mm + "-" + dd;

    //console.log(date);
    connection.query(call, [user, req.body.pid, "", req.body.bank, req.body.account, 0, 0, null, 0, 0, 0, date], //date
        function (err, results) {
            if (err) {
                res.json({ success: false, message: "Could not add account access" })
                console.log("could not add account access")
            } else {
                res.json({ success: true, message: "Added Account Access", admin: admin })
                console.log("added account access")
            }
        }
    );
}).post("/removeAccountAccess", function (req, res) {
    let call = 'call remove_account_access(?, ?, ?, ?)'

    connection.query(call, [user, req.body.pid, req.body.bankID, req.body.account],
        function (err, results) {
            if (err) {
                res.json({ success: false, message: "Could not remove account access" })
                console.log("could not remove account access")
            } else {
                res.json({ success: true, message: "Removed Account Access", admin: admin })
                console.log("removed account access")
            }
        }
    );
});

app.get("/adminAccountAccess", function (req, res) {
    let call = 'select accountID from access'
    let call2 = 'select perID from customer'
    let call3 = 'select bankID from bank'
    connection.query(call, [], function (err, result1) {
        connection.query(call2, [], function (err, result2) {
            connection.query(call3, [], function (err, result3) {
                if (err) {
                    res.json({ success: false, message: "" })
                } else {
                    res.render(__dirname + "/public/" + "adminAccountAccess.ejs", { accounts: result1, customers: result2, banks: result3})
                }
            })
        })
    })
})

app.post("/addAccount", function (req, res) {

    let call = 'call add_account_access(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)'
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var date = yyyy + "-" + mm + "-" + dd;
    console.log("adding account")
    console.log(req.body.pid)
    console.log(req.body.type)
    console.log(req.body.bankID)
    connection.query(call, [user, req.body.pid, req.body.type, req.body.bank, req.body.account, req.body.initbalance, req.body.interest, null, req.body.minbalance, 0, req.body.maxwithdraws, date],
        function (err, results) {
            if (err) {
                console.log(err);
                res.json({ success: false, message: "Could not add account access" })
            } else {
                res.json({ success: true, message: "Added Account Access", admin: admin })
            }
        }
    );
})

/*
 * FRESH EMPLOYEE AND CUSTOMER
 */

app.get("/addNewEmployee", function (req, res) {
    res.sendFile(__dirname + "/public/" + "addNewEmployee.html");
})
app.post("/addEmployee", function (req, res) {
    let call = 'call start_employee_role(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var date = yyyy + "-" + mm + "-" + dd;

    connection.query(call, [req.body.pid, req.body.taxid, req.body.firstname, req.body.lastname, req.body.bdate, req.body.street, req.body.city, req.body.state, req.body.zip, date, req.body.salary, req.body.payments, req.body.earnings, req.body.password],
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
app.get("/addNewCustomer", function (req, res) {
    res.sendFile(__dirname + "/public/" + "addNewCustomer.html");
}).post("/addCustomer", function (req, res) {
    let call = 'call start_customer_role(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var date = yyyy + "-" + mm + "-" + dd;

    connection.query(call, [req.body.pid, req.body.taxid, req.body.firstname, req.body.lastname, req.body.bdate, req.body.street, req.body.city, req.body.state, req.body.zip, date, req.body.password],
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


app.listen(3000, function () {
    console.log("Listening on port 3000...");
});


