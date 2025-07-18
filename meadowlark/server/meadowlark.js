
const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const mainhandler = require('./lib/handlers/main')
const vacationhandler = require('./lib/handlers/vacations')
const handlers = require('./lib/handlers')
const bodyParser = require('body-parser')
const path = require('path')
const multipart = require('multiparty')
const formidable = require('formidable')
const cookieParser = require('cookie-parser')
const { credentials } = require('./config')
const expressSession = require('express-session')
const flashMiddleware = require('./lib/middleware/flash')
const db = require('./db2')
const RedisStore = require('connect-redis')(expressSession)
const redisClient = require('redis').createClient()
const cors = require('cors')

const app = express()


// configure Handlebars view enginer
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

app.use('/api', cors())

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

const port = process.env.PORT || 3033


app.use(express.static(__dirname + '/public'))

app.get('/', mainhandler.home)

app.get('/about', mainhandler.about)

app.get('/headers', mainhandler.headers)

app.get('/newsletter-signup', mainhandler.newsletterSignup)

app.post('/newsletter-signup/process', mainhandler.newsletterSignupProcess)

app.get('/newsletter-signup/thank-you', mainhandler.newsletterSignUpThankYou)

app.get('/newsletter', mainhandler.newsletter)
app.post('/api/newsletter-signup', mainhandler.api.newsletterSignup)

app.get('/contest/vacation-photo/', vacationhandler.vacationPhoto)

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
	if(err) return res.status(500).send({ error: err.message })
	vacationhandler.vacationPhotoContestProcess(req, res, fields, files)
    })
})

app.get('/contest/vacation-photo-thank-you', vacationhandler.vacationPhotoThankYou)

app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
	if(err) return res.status(500).send({ error: err.message })
	console.log("files " + files)
	vacationhandler.api.vacationPhotoContest(req, res, fields, files)
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

app.get('/vacations', vacationhandler.listVacations)

app.get('/notify-me-when-in-season', vacationhandler.notifyWhenInSeasonForm)

app.post('/notify-me-when-in-season', vacationhandler.notifyWhenInSeasonProcess)

app.get('/set-currency/:currency', vacationhandler.setCurrency)


app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    store: new RedisStore({
	url: credentials.redis.url,
	client: redisClient,
	logErrors: true,
    }),
}))

app.get('/api/vacations', handlers.getVacationsApi)
app.get('/api/vacation/:sku', handlers.getVacationBySkuApi)
app.post('/api/vacation/:sku/notify-when-in-season',
	 handlers.addVacationInSeasonListenerApi)
app.delete('/api/vacation/:sku', handlers.requestDeleteVacationApi)

app.use(mainhandler.notFound)

app.use(mainhandler.serverError)


if(require.main === module) {
    app.listen(port, () => {
	console.log(`Express started in ` +
		    `${app.get('env')} mode at http://localhost:${port};`)
    })
} else {
    module.exports = app
}
