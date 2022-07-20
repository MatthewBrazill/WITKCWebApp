'use strict'

const winston = require('winston');

// Create the Logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: './logs/info.log',
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp }) => { return `[${timestamp}] ${level}: ${message}` })
            ),
        }),
        new winston.transports.File({
            filename: './logs/debug.log',
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp }) => { return `[${timestamp}] ${level}: ${message}` })
            ),
        }),
        new winston.transports.File({
            filename: './logs/json.log',
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],
})

module.exports = logger