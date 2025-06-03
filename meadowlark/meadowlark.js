
const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const handlers = require('./lib/handlers')
const bodyParser = require('body-parser')
const path = require('path')
const multipart = require('multiparty')
const formidable = require('formidable')
const cookieParser = require('cookie-parser')
const { credentials } = require('./config')
const expressSession = require('express-session')
const flashMiddleware = require('./lib/middleware/flash')

const app = express()


// configure Handlebars view enginer
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cookieParser(credentials.cookieSecret)) 

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}))

app.use(flashMiddleware)

const port = process.env.PORT || 3000


app.use(express.static(__dirname + '/public'))

app.get('/', handlers.home)

app.get('/about', handlers.about)

app.get('/headers', handlers.headers)

app.get('/newsletter-signup', handlers.newsletterSignup)

app.post('/newsletter-signup/process', handlers.newsletterSignupProcess)

app.get('/newsletter-signup/thank-you', handlers.newsletterSignUpThankYou)

app.get('/newsletter', handlers.newsletter)
app.post('/api/newsletter-signup', handlers.api.newsletterSignup)

app.get('/contest/vacation-photo/', handlers.vacationPhoto)

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
	if(err) return res.status(500).send({ error: err.message })
	handlers.vacationPhotoContestProcess(req, res, fields, files)
    })
})

app.get('/contest/vacation-photo-thank-you', handlers.vacationPhotoThankYou)

app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
	if(err) return res.status(500).send({ error: err.message })
	console.log("files " + files)
	handlers.api.vacationPhotoContest(req, res, fields, files)
    })
})

app.get('/fail', (req, res) => {
    throw new Error('Nope!')
})

app.get('/epic-fail', (req, res) => {
    process.nextTick(() => {
	throw new Error('Kaboom!')
    })
})

// slightly modified version of the official W3C HTML5 email regex:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
const VALID_EMAIL_REGEX = new RegExp("/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/")

app.post('/newsletter', function(req, res){
    const name = req.body.name || '', email = req.body.email || ''
    // input validation
    if(VALID_EMAIL_REGEX.test(email)) {
	req.session.flash = {
	    type: 'danger',
	    intro: 'Validation error!',
	    message: 'The email address you entered was not valid.',
	}
	return res.redirect(303, '/newsletter')
    }
    // NewsletterSignup is an example of an object you might create; since
    // every implementation will vary, it is up to you to write these
    // project-specific interfaces. This simply shows how a typical
    // Express implementation might look in your project
    new NewsletterSignup({ name, email }).save((err) => {
	if(err) {
	    req.session.flash = {
		type: 'danger',
		intro: 'Database error!',
		message: 'There was a database error; please try again later.',
	    }
	    return res.redirect(303, 'newsletter/archive')
	}
	req.session.flash = {
	    type: 'success',
	    intro: 'Thank you!',
	    message: 'You have now been signed up for the newsletter.',
	};
	return res.redirect(303, '/newsletter/archive')
    })
})


app.use(handlers.notFound)

app.use(handlers.serverError)


if(require.main === module) {
    app.listen(port, () => {
	console.log(`Express started in ` +
		    `${app.get('env')} mode at http://localhost:${port};`)
    })
} else {
    module.exports = app
}
