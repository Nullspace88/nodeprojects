
const fortune = require('./fortune')

exports.home = (req, res) => res.render('home')

exports.about = (req, res) =>
res.render('about', { fortune: fortune.getFortune() })

exports.headers = (req, res) => {
    res.type('text/plain')
    const headers = Object.entries(req.headers)
          .map(([key, value]) => `${key}: ${value}`)
    res.send(headers.join('\n'))
}

exports.newsletterSignup = (req, res) => {
    //we will learn about CSRF later...for now, we just
    //provide a dummy value
    res.render("newsletter-signup", { csrf: 'CSRF token goes here' })
}

exports.newsletterSignupProcess = (req, res) => {
    console.log('Form (from querystring): ' + req.query.form)
    console.log('CSRF token (from hidden form field): ' + req.body._csrf)
    console.log('Name (from visible form field): ' + req.body.name)
    console.log('Email (from visible form field): ' + req.body.email)
    res.redirect(303, '/newsletter-signup/thank-you')
}

exports.newsletterSignUpThankYou = (req, res) => {
    res.render('newsletter-signup-thank-you')
}

exports.newsletter = (req, res) => {
    // we will learn about CSRF later... for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' })
}

exports.api = {
    newsletterSignup: (req, res) => {
	console.log('CSRF token (from hidden form field): ' + req.body._csrf)
	console.log('Name (from visible form field): ' + req.body.name)
	console.log('Email (from visible form field): ' + req.body.email)
	res.send({ result: 'success' })
    },
}

exports.vacationPhoto = (req, res) => {
    res.render('contest/vacation-photo', { year: "2022", month: "04", csrf: "csrf" })
}

exports.vacationPhotoContestProcess = (req, res, fields, files) => {
    console.log('field data: ', fields)
    console.log('files: ', files)
    res.redirect(303, '/contest/vacation-photo-thank-you')
}

exports.notFound = (req, res) => res.render('404')

exports.serverError = (err, req, res, next) => res.render('500')
