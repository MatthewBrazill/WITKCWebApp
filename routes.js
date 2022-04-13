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
const safety = require('./controllers/safety.js')
const trip = require('./controllers/trip.js')
const expense = require('./controllers/expense.js')

// Home
router.get('/', home.get)



// Signup
router.get('/signup', signup.get)
router.post('/signup', signup.post)



// Login
router.get('/login', login.get)
router.post('/login', login.post)



// Logout
router.get('/logout', logout.get)



// Contact
router.get('/contact', contact.get)
// Contact APIs
router.post('/api/contact', contact.post) // Send a contact form message



// Profiles
router.get('/profile/me', profile.me)
router.get('/profile/me/settings', profile.settings)
router.get('/profile/:userId', profile.user)
// Profile APIs
router.post('/api/settings/personal', profile.personal) // Update personal settings *requires login*
router.post('/api/settings/customize', profile.customize) // Update customization settings *requires login*
router.post('/api/settings/password', profile.password) // Update password *requires login*
router.post('/api/settings/delete', profile.delete) // Delete account *requires login*



// Committee Dashboard APIs
router.post('/api/safety/award', safety.award) // Award certificate to member *requires safety*
router.post('/api/safety/revoke', safety.revoke) // Remove certificate from member *requires safety*



// Trips
router.get('/trip/create', trip.create)
router.get('/trip/:tripId', trip.view)
// Trips API
router.post('/api/trip/create', trip.apiCreate)



// Equipment
router.get('/equipment/book')
// Equipment API
router.post('/api/equipment/add')
router.post('/api/equipment/get')
router.post('/api/equipment/update')
router.post('/api/equipment/delete')



// Expenses
router.get('/expenses', expense.get)
// Expenses API
router.post('/api/expense/submit', expense.submit)



// Events
router.get('/events', events.get)
// Event APIs
router.post('/api/events/day', events.day) // Get events for the passed date as array
router.post('/api/events/month', events.month) // Get events for the passed month as array



// About
router.get('/about', about.get)
router.get('/committee', committee.get)
router.get('/constitution', constitution.get)



// Privacy and TOS
router.get('/privacy', privacy.get)
router.get('/terms', terms.get)



// General API
router.get('/api/cookie_choice', api.getCookie) // Get cookie choice as boolean (true = allow)
router.get('/api/certs', api.getCerts) // Get all certs as array *requires committee*
router.get('/api/members', api.getMembers) // Get all members as array (Name and ID only) *requires committee*
router.get('/api/safety_boaters', api.getSafetyBoaters) // Get all members as array (Name and ID only) *requires login*
router.post('/api/member', api.getMember) // Get member with memberId *requires login*
router.post('/api/cookie_choice', api.postCookie) // Set cookie choice to preference
router.post('/api/verify', api.verify) // Allow the user to verify their account *requires login*


// Export:
module.exports = router