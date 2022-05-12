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
const api = require('./api.js')
const viewData = require('./view_data.js')

async function start() {
    // Create the app
    const app = express()

    // Create API routes that have no cookies
    app.route('/api/healthy').get((req, res) => res.sendStatus(200))
    app.route('/api/username/exists/:username').get(api.existsUsername)

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
            hashKey: 'sessionId',
            AWSConfigJSON: {
                region: 'eu-west-1'
            },
        }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 28 },
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
    app.use(express.urlencoded({ extended: true }))
    app.use(express.static("./public"))
    app.use(cookie())
    app.use('/', require('./routes.js'))

    // Add 404 Page
    app.use((req, res, next) => {
        res.status(404)
        // Respond with json
        if (req.accepts('json')) res.json({ err: 'Not found' })
        // Respond with HTML page
        else if (req.accepts('html')) viewData.get(req, '404 - Page not found').then((data) => res.render('404', data))
        // Default: Plain-Text
        else res.type('text').send('404 - Page Not Found')
        next
    });

    app.listen(8000, () => {
        logger.info(`Listening on port 8000`)
        console.log(`Listening on port 8000  ->  https://witkc.brazill.net`)
    })
}

// Create Server
start().catch((err) => {
    logger.error(`Fatal error when starting server! ${err.stack}`)
    console.log(`Fatal error when starting server! ${err.stack}`)
})