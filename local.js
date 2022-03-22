'use strict'

// Imports
const app = require("./app.js")
const logger = require('./log.js')

// Wrap in async to allow await call
async function start() {
    const server = await app
    server.listen(8000, () => {
        logger.info(`Listening on port 8000`)
        console.log(`Listening on port 8000  ->  http://localhost:8000/ or https://witkc.brazill.net`)
    })
}

// Create server to allow local testing
start().catch((err) => {
    console.log(err)
})