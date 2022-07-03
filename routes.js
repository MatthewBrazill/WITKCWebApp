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
const safety = require('./controllers/committee/safety.js')
const trip = require('./controllers/app/trip.js')
const expenses = require('./controllers/app/expenses.js')
const captain = require('./controllers/committee/captain.js')
const gear = require('./controllers/app/gear.js')
const pro = require('./controllers/committee/pro.js')
const members = require('./controllers/app/members.js')
const cookies = require('./controllers/app/cookies.js')
const certificates = require('./controllers/app/certificates.js')



// Home
router.get('/', home.homePage)



// Signup
router.get('/signup', signup.signupPage)
router.post('/api/account/create', signup.createAccount)



// Login
router.get('/login', login.loginPage)
router.post('/api/login', login.login)



// Logout
router.get('/logout', logout.logout)



// Contact
router.get('/contact', contact.contactPage)
// Contact APIs
router.post('/api/message/send', contact.sendMessage) // Send a contact form message



// Profiles
router.get('/profile/me', profile.profilePage)
router.get('/profile/me/settings', profile.settingsPage)
router.get('/profile/:userId', profile.userPage)
// Profile APIs
router.post('/api/profile/pesonal/update', profile.updatePersonal) // Update personal settings *requires login*
router.post('/api/profile/settings/update', profile.updateSettings) // Update customization settings *requires login*
router.post('/api/profile/password/update', profile.updatePassword) // Update password *requires login*
router.get('/api/profile/verify', profile.verify) // Request to be verified *requires login*
router.get('/api/profile/delete', profile.delete) // Delete account *requires login*



// Committee Dashboard APIs
router.post('/api/announcement/create', committee.createAnnouncement) // Create a announcement *requires committee*
router.post('/api/announcement/read', committee.readAnnouncement) // Mark an announcement as read *requires login*



// Captain Dashboard APIs
router.post('/api/captain/verify', captain.verify) // Handle member verification *requires captain*
router.get('/api/captain/stats', captain.stats) // Get club statistics *requires captain*



// Safety Dashboard APIs
router.post('/api/safety/certificate/award', safety.awardCertificate) // Award certificate to member *requires safety*
router.post('/api/safety/certificate/revoke', safety.revokeCertificate) // Remove certificate from member *requires safety*
router.post('/api/safety/trip/accept', safety.acceptTrip) // Accept trip too allow it to happen *requires safety*
router.post('/api/safety/trip/reject', safety.rejectTrip) // Reject trip due to safety concerns *requires safety*



// PRO Dashboard APIs
router.post('/api/pro/article/create', pro.createArticle)
router.post('/api/pro/article/get', pro.getArticle)
router.get('/api/pro/article/list', pro.listArticles)
router.post('/api/pro/article/update', pro.updateArticle)
router.post('/api/pro/article/delete', pro.deleteArticle)



// Trips
router.get('/trip/create', trip.createPage)
router.get('/trip/:tripId', trip.viewPage)
// Trips APIs
router.post('/api/trip/create', trip.create) // Create a trip request *requires verified*
router.post('/api/trip/join', trip.join) // Join a trip *requires verified*
router.post('/api/trip/leave', trip.leave) // Leave a trip *requires verified*
router.post('/api/trip/list', trip.list) // List all trips



// Equipment
router.get('/equipment/book', gear.bookPage)
// Equipment APIs
router.post('/api/equipment/create', gear.create) // Add trip to the club *requires equipments*
router.post('/api/equipment/get', gear.get) // Get a specific pice of equipment *requires verified*
router.get('/api/equipment/list', gear.list) // Get all equipment; may be filtered to catagories *requires verified*
router.post('/api/equipment/update', gear.update) // Update a pice of eqipment *requires equipments*
router.post('/api/equipment/delete', gear.delete) // Delete a pice of equipment *requires equipments*



// Expenses
router.get('/expenses', expenses.expensesPage)
// Expenses APIs
router.post('/api/expenses/submit', expenses.submit) // Submit a expense request *requires verified*
router.post('/api/expenses/get', expenses.get) // Get a expense request *requires treasurer*
router.post('/api/expenses/resolve', expenses.resolve) // Resolve a expense request *requires treasurer*



// Events
router.get('/events', events.eventsPage)
// Event APIs
router.post('/api/events/day', events.day) // Get events for the passed date as array
router.get('/api/events/dates', events.dates) // Get an array of all the dates on which there are events, as well as their names



// About
router.get('/about/history', about.historyPage)
router.get('/about/committee', about.committeePage)
router.get('/about/constitution', about.constitutionPage)



// Privacy and TOS
router.get('/privacy', terms.privacyPage)
router.get('/terms', terms.termsPage)



// Cookie APIs
router.get('/api/cookie/check', cookies.check) // Get cookie choice as boolean (true = allow)
router.post('/api/cookie/allow', cookies.allow) // Set cookie choice to preference



// Cert APIs
router.get('/api/certs/list', certificates.list) // Get all certs as array *requires committee*



// Members APIs
router.get('/api/members/list', members.list) // Get all members as array (Name and ID only) *requires verification*
router.post('/api/members/get', members.get) // Get member with memberId *requires committee*


// Export:
module.exports = router