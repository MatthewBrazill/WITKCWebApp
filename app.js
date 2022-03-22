'use strict'

// Import the extensions
const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const express = require('express')
const cookie = require('cookie-parser')
const session = require('express-session')
const sessionStore = require('connect-dynamodb')({ session: session })
const handlebars = require('express-handlebars')
const logger = require('./log.js')

async function createApp() {
    // Create the app
    const app = express()
    
    // Create route for health check that has no cookies
    app.route('/healthy').get((req, res) => res.status(200).send('OK'))

    // Get Parameters from AWS
    const sessionKey = ssm.getParameter({
        Name: 'witkc-session-key',
        WithDecryption: true
    }).promise().then((data) => {
        return data.Parameter.Value
    }).catch((err) => {
        logger.error(`Error getting session key from AWS! ${err}`)
        console.log(`Error getting session key from AWS! ${err}`)
        process.exit(1)
    })

    // Set up session storage middleware
    const sessionHandler = session({
        secret: await sessionKey,
        saveUninitialized: false,
        store: new sessionStore({
            table: 'witkc-sessions',
            hashKey: 'session-id',
            AWSConfigJSON: {
                region: 'eu-west-1'
            },
        }),
        cookie: { maxAge: 1000 * 60 * 60 * 12 },
        resave: false
    })

    // Set up sessions
    app.use((req, res, next) => {
        if (req.url == '/healthy') next()
        else return sessionHandler(req, res, next)
    })
    logger.info(`Session Key Loaded!`)

    // Set up the handlebars view-engine
    app.engine('.hbs', handlebars({
        extname: '.hbs',
        defaultLayout: 'main'
    }))
    app.set('view engine', '.hbs')
    app.set('views', 'views')

    // Remaining WebApp settings
    app.set(express.json())
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static("./public"))
    app.use(cookie())
    app.use('/', require('./routes.js'))

    return app
}

const server = createApp()
module.exports = server