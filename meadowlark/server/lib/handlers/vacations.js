const pathUtils = require('path')
const fs = require('fs')
const fortune = require('../fortune')
const db = require('../../db2')

exports.vacationPhoto = (req, res) => {
    res.render('contest/vacation-photo', { year: "2022", month: "04", csrf: "csrf" })
}

exports.vacationPhotoContestProcess = (req, res, fields, files) => {
    console.log('field data: ', fields)
    console.log('files: ', files)
    res.redirect(303, '/contest/vacation-photo-thank-you')
}

exports.vacationPhotoThankYou = (req, res) => {
    res.render('contest/vacation-photo-thank-you')
}

exports.api = {
    newsletterSignup: (req, res) => {
	console.log('CSRF token (from hidden form field): ' + req.body._csrf)
	console.log('Name (from visible form field): ' + req.body.name)
	console.log('Email (from visible form field): ' + req.body.email)
	res.send({ result: 'success' })
    },
}

// exports.api.vacationPhotoContest = (req, res, fields, files) => {
//     console.log('field data: ', fields)
//     console.log('files: ', files)
//     res.send({ result: 'success' })
// }

const dataDir = pathUtils.resolve(__dirname, '..', 'data')
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos')
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if(!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir)

function saveContestEntry(contestName, email, year, month, photoPath) {
    // TODO...this will come later
}

// we'll want these promise-based versions of fs functions later
const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)

exports.api.vacationPhotoContest = async (req, res, fields, files) => {
    const photo = files.photo[0]
    const dir = vacationPhotosDir + '/' + Date.now()
    const path = dir + '/' + photo.originalFilename
    await mkdir(dir)
    console.log("photo " + photo.filepath)
    console.log("path " + path)
    fs.copyFile(photo.filepath, path, (err) => {
	if(err) console.log(err)
	else {
	}
    }) 
    saveContestEntry('vacation-photo', fields.email,
		     req.params.year, req.params.month, path)
    res.send({ result: 'success' })
}

// old listVacations function that doesn't take currency into consideration
// exports.listVacations = async (req, res) => {
//     const vacations = await db.getVacations({ available: true })

//     const context = {
// 	vacations: vacations.map(vacation => ({
// 	    sku: vacation.sku,
// 	    name: vacation.name,
// 	    description: vacation. description,
// 	    price: '$' + vacation.price.toFixed(2),
// 	    inSeason: vacation.inSeason,
// 	}))
//     }
//     res.render('vacations', context)
// }

exports.notifyWhenInSeasonForm = (req, res) =>
res.render('notify-me-when-in-season', { sku: req.query.sku })

exports.notifyWhenInSeasonProcess = async (req, res) => {
    const { email, sku } = req.body
    await db.addVacationInSeasonListener(email, sku)
    return res.redirect(303, '/vacations')
}

exports.setCurrency = (req, res) => {
    req.session.currency = req.params.currency
    return res.redirect(303, '/vacations')
}

function convertFromUSD(value, currency) {
    switch(currency) {
   case 'USD': return value * 1
    case 'GBP': return value * 0.79
    case 'BTC': return value * 0.000078
    default: return NaN
    }
}

exports.listVacations = async (req, res) => {
    const vacations = await db.getVacations()
    const currency = req.session.currency || 'USD'
    const context = {
	currency: currency,
	vacations: vacations.map(vacation => {
	    return {
		sku: vacation.sku,
		name: vacation.name,
		description: vacation.description,
		inSeason: vacation.inSeason,
		price: convertFromUSD(vacation.price, currency),
		qty: vacation.qty,
	    }
	})
    }
    switch(currency){
    case 'USD': context.currencyUSD = 'selected'; break
    case 'GBP': context.currencyGBP = 'selected'; break
    case 'BTC': context.currencyBTC = 'selected'; break
    }
    res.render('vacations', context)
}
