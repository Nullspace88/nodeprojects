
const http = require("http");
const express = require("express");
const app = express();

app.get('/', (req, res) => {
    res.send('hello root node');
});

const usersRoute =  require('./routes/users.js');

app.use('/users', usersRoute);

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World\n");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
