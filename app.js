'use strict'

const https = require("https")
const express = require('express')
const session = require("express-session")
const handlebars = require('express-handlebars')

const app = express()

// Gather/Set the environmental variables.
const ip = process.env.IP || '127.0.0.1'
const port = process.env.PORT || '80'

// Set up the Handlebars View-Engine
app.engine('.hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'main'
}))
app.set('view engine', '.hbs')
app.set('views', 'views')

app.set(express.json())
app.use(express.static("./public"))
app.use('/', require('./routes.js'))

// Make the app listen and be available on the given port and IP.
app.listen(port, ip, () => console.log(`Connected on http://${ip}:${port}`))