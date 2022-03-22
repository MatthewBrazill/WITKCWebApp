'use strict'

// Imports
const AWS = require('aws-sdk')
const server = require("./app.js")

// Wrap in async to allow await call
async function start() {
    console.log(await server, 'local')
    await server.listen(8000, () => {
        logger.info(`Listening on port 8000`)
        console.log(`Listening on port 8000  ->  http://localhost:8000/ or https://witkc.brazill.net`)
    })
}

// Create server to allow local testing
start()