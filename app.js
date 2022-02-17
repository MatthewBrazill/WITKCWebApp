'use strict'

// Import the Extensions
const fs = require('fs')
const https = require("https")
const AWS = require('aws-sdk')
const express = require('express')
const cookie = require("cookie-parser")
const session = require("express-session")
const handlebars = require('express-handlebars')
const logger = require('./log.js')

// Create the app
const app = express()

// Gather/Set the environmental variables.
const ip = process.env.IP || '127.0.0.1'
const port = process.env.PORT || '80'
const sessionKey = process.env.SESSION || /* fs.readFileSync('./credentials/session-key') || */ '@z<D}OS?7xq(zo<p+?j)IC=ZBTO>bhFRn;t/Y*ub/~O{6F|4gdnwASg3G?/nc&Ix'

// Set up the Handlebars View-Engine
app.engine('.hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'main'
}))
app.set('view engine', '.hbs')
app.set('views', 'views')

// Set up Sessions
app.use(session({
    secret: sessionKey,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 12 },
    resave: false
}))

app.set(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"))
app.use(cookie())
app.use('/', require('./routes.js'))

// Make the app listen and be available on the given port and IP.
app.listen(port, () => {
    logger.info(`Listening on http://${ip}:${port}`)
    console.log(`Listening on http://${ip}:${port}`)
})
