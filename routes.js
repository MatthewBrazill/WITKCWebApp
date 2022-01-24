'use strict'

// Create the Router
const router = require('express').Router()

// Import the necessary controllers:
const login = require('./controllers/login.js')
const signup = require('./controllers/signup.js')
const home = require('./controllers/home.js')
const about = require('./controllers/about.js')
const committee = require('./controllers/committee.js')
const events = require('./controllers/events.js')
const contact = require('./controllers/contact.js')

// Attach the controllers to the matching routes:
router.get('/', home.index)
router.get('/login', login.index)
router.get('/signup', signup.index)
router.get('/about', about.index)
router.get('/committee', committee.index)
router.get('/events', events.index)
router.get('/contact', contact.index)

// Export:
module.exports = router