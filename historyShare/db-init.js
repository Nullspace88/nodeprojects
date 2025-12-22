const { credentials } = require('./config')

const { Client } = require('pg')
const { connectionString } = credentials.postgres
const client = new Client({ connectionString })

const createScript = `
CREATE TABLE IF NOT EXISTS users (
authId SERIAL PRIMARY KEY,
username varchar(200),
password varchar(200),
firstname varchar(200),
lastname varchar(200)
);`

client.connect().then(async () => {
    try {
	console.log('creating database schema')
	await client.query(createScript)
    } catch (err) {
	console.log('Error: could not initialize database')
	console.log(err.message)
    } finally {
	client.end()
    }
})
