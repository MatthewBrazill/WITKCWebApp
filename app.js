'use strict'

const express = require('express')
const exphbs = require('express-handlebars')

const app = express()

// Gather/Set the environmental variables.
const ip = process.env.IP || '127.0.0.1'
const port = process.env.PORT || '80'

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main'
}))
app.set('view engine', '.hbs')
app.use('/', require('./routes.js'))

// Make the app listen and be available on the given port and IP.
app.listen(port, ip, () => console.log(`Connected on http://${ip}:${port}`))