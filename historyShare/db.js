
const { Pool } = require('pg')

const { credentials } = require('./config')

const { connectionString } = credentials.postgres
const pool = new Pool({ connectionString })

module.exports = {
    addUser: async data => {
	await pool.query(
	    'INSERT INTO USERS (username, password, firstname, lastname) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', data)
    },

    getCredentials: async data => {
	const { rows } = await pool.query(
	    'SELECT password FROM USERS WHERE username = $1', data)
	return rows
    }
}
