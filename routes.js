'use strict'

// Create the Router
const router = require('express').Router()

// Import the necessary controllers:
const home = require('./controllers/pages/home.js')
const login = require('./controllers/app/login.js')
const logout = require('./controllers/app/logout.js')
const signup = require('./controllers/app/signup.js')
const contact = require('./controllers/pages/contact.js')
const about = require('./controllers/pages/about.js')
const committee = require('./controllers/committee/committee.js')
const events = require('./controllers/pages/events.js')
const profile = require('./controllers/app/profile.js')
const terms = require('./controllers/pages/terms.js')
const api = require('./api.js')
const safety = require('./controllers/committee/safety.js')
const trip = require('./controllers/app/trip.js')
const expenses = require('./controllers/app/expenses.js')
const captain = require('./controllers/committee/captain.js')
const gear = require('./controllers/app/gear.js')



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
router.get('/api/settings/delete', profile.delete) // Delete account *requires login*



// Committee Dashboard APIs
router.post('/api/committee/announcement/create', committee.createAnnouncement) // Create a announcement *requires committee*
router.post('/api/committee/announcement/mark_as_read', committee.markAnnouncementRead) // Mark an announcement as read *requires login*
router.post('/api/captain/verify', captain.verify) // Set member to verified *requires captain*
router.get('/api/captain/stats', captain.stats) // Get club statistics *requires captain*
router.post('/api/safety/award', safety.award) // Award certificate to member *requires safety*
router.post('/api/safety/revoke', safety.revoke) // Remove certificate from member *requires safety*
router.post('/api/safety/accept', safety.accept) // Accept trip too allow it to happen *requires safety*
router.post('/api/safety/reject', safety.delete) // Reject trip due to safety concerns *requires safety*



// Trips
router.get('/trip/create', trip.create)
router.get('/trip/:tripId', trip.view)
// Trips API
router.post('/api/trip/create', trip.apiCreate) // Create a trip request *requires verified*
router.post('/api/trip/join', trip.join) // Join a trip *requires verified*
router.post('/api/trip/leave', trip.leave) // Leave a trip *requires verified*
router.post('/api/trip/list', trip.list) // List all trips



// Equipment
router.get('/equipment/book', gear.book)
// Equipment API
router.post('/api/equipment/add', gear.create) // Add trip to the club *requires equipments*
router.post('/api/equipment/get', gear.get) // Get a specific pice of equipment *requires verified*
router.post('/api/equipment/get_all', gear.getAll) // Get all equipment; may be filtered to catagories *requires verified*
router.post('/api/equipment/delete', gear.delete) // Delete a pice of equipment *requires equipments*



// Expenses
router.get('/expenses', expenses.create)
// Expenses API
router.post('/api/expenses/submit', expenses.submit) // Submit a expense request *requires verified*
router.post('/api/expenses/resolve', expenses.resolve) // Resolve a expense request *requires treasurer*
router.post('/api/expenses/get', expenses.get) // Get a expense request *requires treasurer*



// Events
router.get('/events', events.get)
// Event APIs
router.post('/api/events/day', events.day) // Get events for the passed date as array
router.post('/api/events/month', events.month) // Get events for the passed month as array



// About
router.get('/about/history', about.history)
router.get('/about/committee', about.committee)
router.get('/about/constitution', about.constitution)



// Privacy and TOS
router.get('/privacy', terms.privacy)
router.get('/terms', terms.terms)



// General API
router.get('/api/cookie_choice', api.getCookie) // Get cookie choice as boolean (true = allow)
router.get('/api/certs', api.getCerts) // Get all certs as array *requires committee*
router.get('/api/members', api.getMembers) // Get all members as array (Name and ID only) *requires committee*
router.get('/api/safety_boaters', api.getSafetyBoaters) // Get all members as array (Name and ID only) *requires login*
router.post('/api/member', api.getMember) // Get member with memberId *requires login*
router.post('/api/cookie_choice', api.postCookie) // Set cookie choice to preference


// Export:
module.exports = router