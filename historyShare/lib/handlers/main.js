
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../../db')

exports.home = (req, res) => {
    console.log(req.session.userName)
    if (req.session.userName) {
	res.render("home", {username: req.session.userName})
    } else {
	res.render("home");
    }
}

exports.login = (req, res) => {
    res.render("login");
}

exports.acceptLogin = async (req, res) => {
    console.log("Username: " + req.body.username);
    console.log("Password: " + req.body.password);
    const response = await db.getCredentials([req.body.username])
    const storedHash = response[0]['password']
    const providedPass = req.body.password
    bcrypt.compare(providedPass, storedHash, function(err, result) {
	if (err) throw err
	if (result === true) {
	    req.session.userName = req.body.username
	    req.session.save(err => {})
	    console.log("Password match")
	    res.render("home", {username: req.body.username})
	} else {
	    console.log("Password failed match")
	    res.render("home");
	}
    })
}

exports.signup = (req, res) => {
    res.render("signup");
}

exports.acceptSignup = async (req, res) => {
    console.log("Username: " + req.body.username);
    console.log("Password: " + req.body.password);
    console.log("First name: " + req.body.firstname);
    console.log("Last name: " + req.body.lastname);
    try {
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
	    if (err) throw err;
	    db.addUser([req.body.username, hash,
			req.body.firstname, req.body.lastname]);
	})	       
    } catch (error) {
	console.error(error.message)
    }
    res.render("home");
}
