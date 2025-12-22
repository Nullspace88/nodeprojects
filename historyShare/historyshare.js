
const express = require("express")
const expressHandlebars = require('express-handlebars').engine
const handlers = require("./lib/handlers/main");
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTION');

    next();
});

app.get("/login", handlers.login);

app.post("/login", handlers.acceptLogin);

app.get("/signup", handlers.signup);

app.post("/signup", handlers.acceptSignup);

app.get("/", handlers.home);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
