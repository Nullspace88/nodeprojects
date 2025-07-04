
const { Pool } = require('pg')
const _ = require('lodash')

const { credentials } = require('./config')

const { connectionString } = credentials.postgres
const pool = new Pool({ connectionString })

module.exports = {
    getVacations: async () => {
	const { rows } = await pool.query('SELECT * FROM VACATIONS')
	return rows.map(row => {
	    const vacation = _.mapKeys(row, (v, k) => _.camelCase(k))
	    vacation.price = parseFloat(vacation.price.replace(/^\$/,''))
	    vacation.location = {
		search: vacation.locationSearch,
		coordinates: {
		    lat: vacation.locationLat,
		    lng: vacation.locationLng,
		},
	    }
	    return vacation
	})
    },

    getVacationBySku: async (sku) => {
	const { rows } = await pool.query('SELECT * FROM VACATIONS WHERE sku= $1', [sku])
	return rows.map(row => {
	    const vacation = _.mapKeys(row, (v, k) => _.camelCase(k))
	    vacation.price = parseFloat(vacation.price.replace(/^\$/,''))
	    vacation.location = {
		search: vacation.locationSearch,
		coordinates: {
		    lat: vacation.locationLat,
		    lng: vacation.locationLng,
		},
	    }
	    return vacation
	})
    },

    addVacationInSeasonListener: async (email, sku) => {
	await pool.query(
	    'INSERT INTO vacation_in_season_listeners (email, sku, '+
		'delete_requested) ' +
		'VALUES ($1, $2, false) ' +
		'ON CONFLICT DO NOTHING',
	    [email, sku]
	)
    },

    requestDeleteVacation: async (email, sku) => {
	await pool.query(
	    'UPDATE vacation_in_season_listeners SET delete_requested' +
		'= true WHERE email = $1 AND sku = $2', [email, sku]
	)
    }
}
