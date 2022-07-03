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
const datadogRum = require('@datadog/browser-rum').datadogRum

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
        // Respond with HTML page
        if (req.accepts('html')) viewData.get(req, '404 - Page not found').then((data) => res.render('404', data))
        // Respond with json
        else if (req.accepts('json')) res.json({ err: 'Not found' })
        // Default: Plain-Text
        else res.type('text').send('404 - Page Not Found')
        next
    });

    app.listen(8000, () => {
        logger.info(`Listening on port 8000`)
        console.log(`Listening on port 8000  ->  https://witkc.brazill.net`)
    })
}

datadogRum.init({
    applicationId: 'd8892f0f-d31f-4804-b21e-c630a433a383',
    clientToken: 'pub86493d96655e179161fb37ff340b7255',
    site: 'datadoghq.com',
    service: 'witkc-web-app',

    // Specify a version number to identify the deployed version of your application in Datadog 
    // version: '1.0.0',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input'
});
datadogRum.startSessionReplayRecording();

// Create Server
start().catch((err) => {
    logger.error(`Fatal error when starting server! ${err.stack}`)
    console.log(`Fatal error when starting server! ${err.stack}`)
})