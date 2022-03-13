'use strict'

// Import the Extensions
const AWS = require('aws-sdk')
const express = require('express')
const cookie = require("cookie-parser")
const session = require("express-session")
const handlebars = require('express-handlebars')
const logger = require('./log.js')

// Create the app
const app = express()
AWS.config.update({region: 'eu-west-1'})
const ssm = new AWS.SSM()

// Set up Sessions
ssm.getParameters({ Names: ['witkc-session-key'], WithDecryption: true }, (err, data) => {
    if (err) {
        logger.error(`Error getting session key from AWS! ${err}`)
        console.log(`Error getting session key from AWS! ${err}`)
        process.exit(1)
    } else if (data.Parameters.length = 1) {
        app.use(session({
            secret: data.Parameters[0].Value,
            saveUninitialized: true,
            cookie: { maxAge: 1000 * 60 * 60 * 12 },
            resave: false
        }))
        logger.info(`Session Key Loaded!`)
    }
})

// Set up the Handlebars View-Engine
app.engine('.hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'main'
}))
app.set('view engine', '.hbs')
app.set('views', 'views')

// Remaining WebApp Settings
app.set(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"))
app.use(cookie())
app.use('/', require('./routes.js'))

// Start app on port 8000
app.listen(8000, () => {
    logger.info(`Listening on port 8000`)
    console.log(`Listening on port 8000  ->  http://localhost:8000/ or https://witkc.brazill.net`)
})