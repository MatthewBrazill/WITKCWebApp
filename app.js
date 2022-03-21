'use strict'

// Import the Extensions
const AWS = require('aws-sdk')
const express = require('express')
const cookie = require('cookie-parser')
const session = require('express-session')
const sessionStore = require('connect-dynamodb')({ session: session })
const handlebars = require('express-handlebars')
const logger = require('./log.js')

// Create the app
const app = express()
AWS.config.update({ region: 'eu-west-1' })
const ssm = new AWS.SSM()

// Create route for health check that has no cookies
app.route('/healthy').get((req, res) => res.status(200).send('OK'))

// Get Parameters from AWS
ssm.getParameters({ Names: ['witkc-session-key'], WithDecryption: true }, (err, data) => {
    // Check for Success
    if (err) {
        logger.error(`Error getting session key from AWS! ${err}`)
        console.log(`Error getting session key from AWS! ${err}`)
        process.exit(1)
    } else if (data.Parameters.length = 1) {
        const sessionHandler = session({
            secret: data.Parameters[0].Value,
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
        // Set up Sessions
        app.use((req, res, next) => {
            if (req.url == '/healthy') next()
            else return sessionHandler(req, res, next)
        })

        logger.info(`Session Key Loaded!`)

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
    }
})