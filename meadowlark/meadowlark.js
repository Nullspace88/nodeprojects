
const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const fortune = require('./lib/fortune')

const app = express()



// configure Handlebars view enginer
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => { res.render('home') })

app.get('/about', (req, res) => {
    res.render('about', {fortune: fortune.getFortune() })
})

app.use((req, res) => {
    res.status(404)
    res.send('404 - Not Found')
})

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500)
    res.send('500 - Server Error')
})

app.listen(port, () => console.log(`Express started on http://localhost:${port};`))
