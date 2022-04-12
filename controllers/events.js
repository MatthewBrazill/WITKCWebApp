'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const viewData = require('../view_data.js')

const events = {
    async get(req, res) {
        var data = await viewData.get(req, 'Events')
        data.scripts.events = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/events_scripts.js' })
        
        logger.info(`Session '${req.sessionID}': Getting Events`)
        res.render('events', data)
    },

    async day(req, res) {
        // Implement after event and trips database
        res.status(200).json({ events: [] })
    },

    async month(req, res) {
        // Implement after event and trips database
        res.status(200).json({ events: [] })
    }
}

module.exports = events