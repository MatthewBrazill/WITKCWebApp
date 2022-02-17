'use strict'

const winston = require('winston');

// Create the Logger
const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: './logs/combined.log' }),
        new winston.transports.File({ filename: './logs/error.log', level: 'error' })
    ],
})

module.exports = logger