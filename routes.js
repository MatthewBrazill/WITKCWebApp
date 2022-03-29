'use strict'

// Create the Router
const router = require('express').Router()

// Import the necessary controllers:
const home = require('./controllers/home.js')
const login = require('./controllers/login.js')
const logout = require('./controllers/logout.js')
const signup = require('./controllers/signup.js')
const contact = require('./controllers/contact.js')
const about = require('./controllers/about.js')
const committee = require('./controllers/committee.js')
const events = require('./controllers/events.js')
const constitution = require('./controllers/constitution.js')
const profile = require('./controllers/profile.js')
const privacy = require('./controllers/privacy.js')
const terms = require('./controllers/terms.js')
const api = require('./api.js')

// Attach the controllers to the matching routes:
router.get('/', home.get)

router.get('/login', login.get)
router.post('/login', login.post)

router.get('/logout', logout.get)

router.get('/cookie_choice', api.getCookie)
router.post('/cookie_choice', api.postCookie)

router.get('/signup', signup.get)
router.post('/signup', signup.post)

router.get('/contact', contact.get)
router.post('/contact', contact.post)

router.get('/profile/me', profile.me)
router.get('/profile/me/settings', profile.settings)
router.get('/profile/:username', profile.user)
router.post('/profile/me/settings/personal', profile.personal)
router.post('/profile/me/settings/customize', profile.customize)
router.post('/profile/me/settings/password', profile.password)
router.post('/profile/me/settings/delete', profile.delete)

router.get('/events', events.get)
router.post('/events/day', events.day)
router.post('/events/month', events.month)

router.get('/about', about.get)
router.get('/committee', committee.get)
router.get('/constitution', constitution.get)
router.get('/privacy', privacy.get)
router.get('/terms', terms.get)

// Export:
module.exports = router