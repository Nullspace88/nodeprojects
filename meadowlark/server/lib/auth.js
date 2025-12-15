
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const db = require('../db')

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser((id, done) => {
    db.getUserById(id)
	.then(user => done(null, user))
        .catch(err => done(err, null))
})

module.exports = (app, options) => {
    //if success and failure redirects aren't specified,
    //set some reasonable defaults
    if(!options.successRedirect) options.successRedirect = '/account'
    if(!options.failureRedirect) options.failureRedirect = '/login'
    return {
	init: function() {
	    let config = options.providers
	    console.log("init function ran")
	    //configure Facebook strategy
	    passport.use(new FacebookStrategy({
		clientID: config.facebook.appId,
		clientSecret: config.facebook.appSecret,
		callbackURL: (options.baseURL || '') + '/auth/facebook/callback', }, (accessToken, refreshToken, profile, done) => {
		    const authId = 'facebook:' + profile.id
		    db.getUserByAuthId(authId)
		        .then(user => {
			    if(user) return done(null, user)
			    db.addUser({
				authId: authId,
				name: profile.displayName,
				created: new Date(),
				role: 'customer',
			    })
				.then(user => done(null, user))
			        .catch(err => done(err, null))
			})
		        .catch(err => {
			    if(err) return done(err, null);
			})
		}))
	    app.use(passport.initialize())
	    app.use(passport.session())
	},
	registerRoutes: () => {
	    app.get('/auth/facebook', (req, res, next) => {
		if(req.query.redirect) req.session.authRedirect = req.query.redirect
		passport.authenticate('facebook')(req, res, next)
	    })
	    app.get('/auth/facebook/callback', passport.authenticate('facebook',
		{ failureRedirect: options.failureRedirect }),
		    (req, res) => {
			// we only get here on successful authentication
			console.log("successful authentication callback")
			const redirect = req.sessions.authRedirect
			if(redirect) delete req.session.authRedirect
			res.redirect(303, redirect || options.successRedirect)
		    }
		   )
	},
    }
}


