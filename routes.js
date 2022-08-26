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
const bookings = require('./controllers/app/bookings.js')



// Home
router.get('/home', home.homePage) // GET HTML for homepage



// Signup
router.get('/signup', signup.signupPage) // GET HTML for signup page

// Signup APIs
router.post('/api/account/create', signup.createAccount) // POST the details to create a new account



// Login
router.get('/login', login.loginPage) // GET HTML for login page

// Login APIs
router.post('/api/login', login.login) // POST login details to autheticate



// Logout
router.get('/logout', logout.logout) // GET to log out the user (Destroy session)



// Contact
router.get('/contact', contact.contactPage) // GET HTML of contact page

// Contact APIs
router.post('/api/message/send', contact.sendMessage) // POST contect message to the club



// Profiles
router.get('/profile/me', profile.profilePage) // GET HTML for user profile page
router.get('/profile/me/settings', profile.settingsPage) // GET HTML for settings page
router.get('/profile/:memberId', profile.userPage) // GET HTML for member profile

// Profile APIs
router.post('/api/profile/pesonal/update', profile.updatePersonal) // LOGIN POST to update user personal details
router.post('/api/profile/settings/update', profile.updateSettings) // LOGIN POST to update user settings
router.post('/api/profile/password/update', profile.updatePassword) // LOGIN POST to update user password
router.get('/api/profile/verify', profile.verify) // LOGIN GET to make a verification request
router.get('/api/profile/delete', profile.delete) // LOGIN GET to delete user account



// Committee Dashboard APIs
router.post('/api/announcement/create', committee.createAnnouncement) // COMMITTEE POST to create a new announcement
// TODO GET ANNOUNCEMENT // LOGIN POST to get an announcement
// TODO LIST ANNOUNCEMENT // LOGIN GET to list all announcements
// TODO UPDATE ANNOUNCEMENT // COMMITTEE POST to update an announcement
router.post('/api/announcement/read', committee.readAnnouncement) // LOGIN POST to mark an announcement as read
// TODO DELETE ANNOUNCEMENT // COMMITTEE POST to delete an announcement



// Captain Dashboard APIs
router.post('/api/captain/verify', captain.verify) // CAPTAIN POST to verify or remove a user
router.get('/api/captain/stats', captain.stats) // CAPTAIN GET club statistics



// Safety Dashboard APIs
router.post('/api/safety/certificate/award', safety.awardCertificate) // SAFETY POST to award users a certificate
router.post('/api/safety/certificate/revoke', safety.revokeCertificate) // SAFETY POST to revoke a users certificate
router.post('/api/safety/trip/accept', safety.acceptTrip) // SAFETY POST to accept a trip as safe
router.post('/api/safety/trip/reject', safety.rejectTrip) // SAFETY POST to reject and delete a trip


// PRO Dashboard APIs
router.post('/api/pro/article/create', pro.createArticle) // PRO POST to create a new article
router.post('/api/pro/article/get', pro.getArticle) // PRO POST to get an article object
router.get('/api/pro/article/list', pro.listArticles) // PRO GET all article objects
router.post('/api/pro/article/update', pro.updateArticle) // PRO POST to update an article
router.post('/api/pro/article/delete', pro.deleteArticle) // PRO POST to delete an article



// Trips
router.get('/trip/create', trip.createPage) // GET HTML of create trip page
router.get('/trip/edit/:tripId', trip.editPage) // GET HTML of edit trip page
router.get('/trip/:tripId', trip.viewPage) // GET HTML of view trip page

// Trips APIs
router.post('/api/trip/create', trip.create) // VERIFIED POST to create a trip request
// TODO GET TRIP // POST to get a trip
router.get('/api/trip/list', trip.list) // GET list of all trips
router.post('/api/trip/update', trip.update) // OWNER/SAFETY POST to update a trip
router.post('/api/trip/join', trip.join) // VERIFIED POST to join a trip
router.post('/api/trip/leave', trip.leave) // VERIFIED POST to leave a trip
router.post('/api/trip/delete', trip.delete) // OWNER/SAFETY POST to delete a trip



// Equipment
router.get('/equipment/book', bookings.bookPage) // GET HTML of equipment booking page
// Equipment APIs
router.post('/api/equipment/create', gear.create) // EQUIPMENTS POST to create a new item of equipment
router.post('/api/equipment/available', bookings.available) // VERIFIED POST to check if an item of equipemnt is available to be booked
router.post('/api/equipment/get', gear.get) // VERIFIED POST to get a equipment item
router.get('/api/equipment/list', gear.list) // VERIFIED GET to list all equipment
router.get('/api/equipment/find', gear.find) // VERIFIED POST to find equipment based on flilters and a search query
router.post('/api/equipment/book', bookings.book) // VERIFIED POST to book an item of equipment
router.post('/api/equipment/update', gear.update) // EQUIPMENTS POST to update an item of equipment
router.post('/api/equipment/delete', gear.delete) // EQUIPMENTs POST to delete an item of equipment
// Bookings APIs
router.get('/api/bookings/dates', bookings.dates) // VERIFIED GET to list all bookings for the owning member
router.get('/api/bookings/list', bookings.list) // VERIFIED GET to list all bookings for the owning member
router.post('/api/bookings/update', bookings.update) // OWNER POST to update a booking
router.post('/api/bookings/delete', bookings.delete) // OWNER POST to delete a booking



// Expenses
router.get('/expenses', expenses.expensesPage) // GET HTML of expenses page
// Expenses APIs
router.post('/api/expenses/submit', expenses.submit) // VERIFIED POST to submit an expense
router.post('/api/expenses/get', expenses.get) // TREASURER POST to get a expense report
router.post('/api/expenses/resolve', expenses.resolve) // TREASURER POST to resolve an expense report



// Events
router.get('/events', events.eventsPage) // GET HTML of events page
// Event APIs
router.post('/api/events/day', events.day) // POST to get all events on a day
router.get('/api/events/all', events.all) // GET all events



// About
router.get('/about/history', about.historyPage) // GET HTML of history page
router.get('/about/committee', about.committeePage) // GET HTML of committee page
router.get('/about/constitution', about.constitutionPage) // GET HTML of constitution page



// Privacy and TOS
router.get('/privacy', terms.privacyPage) // GTE HTML of privacy policy page
router.get('/terms', terms.termsPage) // GET HTML of ToS page



// Cookie APIs
router.get('/api/cookie/check', cookies.check) // GET cookie check
router.post('/api/cookie/allow', cookies.allow) // POST cookie choice



// Cert APIs
router.get('/api/certs/list', certificates.list) // SAFETY GET list of certificates



// Members APIs
router.get('/api/members/list', members.list) // VERIFIED GET list of club members (only ID, First-, Last Name and Img)
router.post('/api/members/get', members.get) // COMMITTEE GET a club member
router.post('/api/members/resolve', members.reslove) // GET the result of is a username is taken



// Export:
module.exports = router