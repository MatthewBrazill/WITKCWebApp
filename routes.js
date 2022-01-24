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
router.get('/', home.get)
router.get('/login', login.get)
router.post('/login', login.post)
router.get('/signup', signup.get)
router.get('/about', about.get)
router.get('/committee', committee.get)
router.get('/events', events.get)
router.get('/contact', contact.get)

// Export:
module.exports = router