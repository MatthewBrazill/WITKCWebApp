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

// Attach the controllers to the matching routes:
router.get('/', home.get)

router.get('/login', login.get)
router.post('/login', login.post)

router.get('/logout', logout.get)

router.get('/signup', signup.get)
router.post('/signup', signup.post)

router.get('/contact', contact.get)
router.post('/contact', contact.post)

router.get('/profile', profile.get)
router.post('/profile', profile.post)

router.get('/about', about.get)
router.get('/committee', committee.get)
router.get('/constitution', constitution.get)
router.get('/events', events.get)

// Export:
module.exports = router