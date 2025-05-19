
let mysql = require("mysql");

let con = mysql.createConnection({
    host: "localhost",
    user: "brendan",
    password: "password",
    database: "firsttest"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("connected!");
    let sql = "SHOW databases;"
    con.query(sql, function (err, result, fields) {
	if (err) throw err;
	for (obj in fields) {
	    for (key in obj) {
		console.log("Result: " + fields[obj] );
	    }
	}
    });
});
    
