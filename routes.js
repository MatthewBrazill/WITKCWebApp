'use strict'

// Create the Router
const router = require('express').Router()

// Import the necessary controllers:
const login = require('./controllers/login.js')
const signup = require('./controllers/signup.js')
const front = require('./controllers/front.js')

// Attach the controllers to the matching routes:
router.get('/', front.index)
router.get('/login', login.index)
router.get('/signup', signup.index)

// Export:
module.exports = router