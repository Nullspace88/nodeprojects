
const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const handlers = require('./lib/handlers')
const bodyParser = require('body-parser')
const path = require('path')
const multipart = require('multiparty')

const app = express()


// configure Handlebars view enginer
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
	if(err) return res.status(500).send({ error: err.message })
	handlers.vacationPhotoContestProcess(req, res, fields, files)
    })
})

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))


app.use(handlers.notFound)

app.use(handlers.serverError)

if(require.main === module) {
    app.listen(port, () => {
	console.log(`Express started on http://localhost:${port};`)
    })
} else {
    module.exports = app
}
