
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
const db = require('./db')
const RedisStore = require('connect-redis').default
const redisClient = require('redis').createClient({url: credentials.redis.url})
const cors = require('cors')
const csrf = require('csurf')
const createAuth = require('./lib/auth')



if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error)
}

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

/* app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
})) */

let redisStore = new RedisStore({
    url: credentials.redis.url,
    client: redisClient,
    logErrors: true,
})

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    store: redisStore,
}))

app.use(csrf({ cookie: true }))
app.use((req, res, next) => {
    res.locals._csrfToken = req.csrfToken()
    next()
})

app.use(flashMiddleware)

const port = process.env.PORT || 3033

app.use(express.static(__dirname + '/public'))

app.get('/', mainhandler.home)

app.get('/about', mainhandler.about)

app.get('/headers', mainhandler.headers)

// calls /api/newsletter-signup
app.get('/newsletter-signup', mainhandler.newsletterSignup)

// nothing calls this
//app.post('/newsletter-signup/process', mainhandler.newsletterSignupProcess)

// called by /newsletter-signup/process
//app.get('/newsletter-signup/thank-you', mainhandler.newsletterSignUpThankYou)

// calls post to /newsletter which doesn't work
app.get('/newsletter', mainhandler.newsletter)

// called by /newsletter-signup
app.post('/api/newsletter-signup', mainhandler.api.newsletterSignup)

// calls post to /contest/vacation-photo/:year/:month but overridden to
// call post to /api/vacation-photo-contest/:year/:month
app.get('/contest/vacation-photo/', vacationhandler.vacationPhoto)

// calls /contest/vacation-photo-thank-you
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
    if(err) return res.status(500).send({ error: err.message })
    vacationhandler.vacationPhotoContestProcess(req, res, fields, files)
    })
})

// called by post to /contest/vacation-photo/:year/:month
app.get('/contest/vacation-photo-thank-you', vacationhandler.vacationPhotoThankYou)

// called by post from /contest/vaction-photo/ 
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

// called by post to /newsletter but doesn't work
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
        return res.redirect(303, '/newsletter/archive')
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


app.get('/api/vacations', handlers.getVacationsApi)
app.get('/api/vacation/:sku', handlers.getVacationBySkuApi)
app.post('/api/vacation/:sku/notify-when-in-season',
    handlers.addVacationInSeasonListenerApi)
app.delete('/api/vacation/:sku', handlers.requestDeleteVacationApi)

const auth = createAuth(app, {
    //baseUrl is optional; it will default to localhost if you omit it;
    //it can be helpful to set this if you're not working on
    //your local machine. For example, if you were using a staging server,
    //you might set the BASE_URL environment variable to
    //https://staging.meadowlark.com
    baseUrl: process.env.BASE_URL,
    providers: credentials.authProviders,
    successRedirect: '/account',
    failureRedirect: '/unauthorized',
})

//auth.init() links in Passport middleware:
auth.init()

//now we can specify our auth routes:
auth.registerRoutes()



app.get('/login', (req, res) => {
    res.render('login')
})
    
// app.get('/account', (req, res) => {
//     if(!req.user)
// 	return res.redirect(303, '/unauthorized')
//     res.render('account', { username: req.user.name })
// })
//we also need an 'unauthorized' page
app.get('/unauthorized', (req, res) => {
    res.status(403).render('unauthorized')
})
// and a way to logout
app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

const customerOnly = (req, res, next) => {
    if(req.user && req.user.role === 'customer') return next()
    // we want customer-only pages to know they need to logon
    res.redirect(303, '/unauthorized')
}

const employeeOnly = (req, res, next) => {
    if(req.user && req.user.role === 'employee') return next()
    // we want employee-only authorization failures to be "hidden", to
    // prevent potential hackers from even knowing that such a page exists
    next('route')
}

// customer routes

app.get('/account', customerOnly, (req, res) => {
    res.render('account', { username: req.user.name })
})

app.get('/account/order-history', customerOnly, (req, res) => {
    res.render('account/order-history')
})

app.get('/account/email-prefs', customerOnly, (req, res) => {
    res.render('account/email-prefs')
})

// employer routes

app.get('/sales', employeeOnly, (req, res) => {
    res.render('sales')
})

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
