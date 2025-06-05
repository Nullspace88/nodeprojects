const pathUtils = require('path')
const fs = require('fs')
const fortune = require('./fortune')
const db = require('../db')

exports.home = (req, res) => res.render('home')

exports.about = (req, res) =>
res.render('about', { fortune: fortune.getFortune() })

exports.headers = (req, res) => {
    res.type('text/plain')
    const headers = Object.entries(req.headers)
          .map(([key, value]) => `${key}: ${value}`)
    res.send(headers.join('\n'))
}

exports.newsletterSignup = (req, res) => {
    //we will learn about CSRF later...for now, we just
    //provide a dummy value
    res.render("newsletter-signup", { csrf: 'CSRF token goes here' })
}

exports.newsletterSignupProcess = (req, res) => {
    console.log('Form (from querystring): ' + req.query.form)
    console.log('CSRF token (from hidden form field): ' + req.body._csrf)
    console.log('Name (from visible form field): ' + req.body.name)
    console.log('Email (from visible form field): ' + req.body.email)
    res.redirect(303, '/newsletter-signup/thank-you')
}

exports.newsletterSignUpThankYou = (req, res) => {
    res.render('newsletter-signup-thank-you')
}

exports.newsletter = (req, res) => {
    // we will learn about CSRF later... for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' })
}

exports.api = {
    newsletterSignup: (req, res) => {
	console.log('CSRF token (from hidden form field): ' + req.body._csrf)
	console.log('Name (from visible form field): ' + req.body.name)
	console.log('Email (from visible form field): ' + req.body.email)
	res.send({ result: 'success' })
    },
}

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

exports.listVacations = async (req, res) => {
    const vacations = await db.getVacations({ available: true })
    const context = {
	vacations: vacations.map(vacation => ({
	    sku: vacation.sku,
	    name: vacation.name,
	    description: vacation. description,
	    price: '$' + vacation.price.toFixed(2),
	    inSeason: vacation.inSeason,
	}))
    }
    res.render('vacations', context)
}

exports.notFound = (req, res) => res.render('404')

exports.serverError = (err, req, res, next) => res.render('500')
