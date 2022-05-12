'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const viewData = require('../../view_data.js')
const committeeData = require('../../data_managers/committee.js')

const about = {
    async history(req, res) {
        var data = await viewData.get(req, 'About Us')
        
        logger.info(`Session '${req.sessionID}': Getting About`)
        res.render('about', data)
    },

    async committee(req, res) {
        var data = await viewData.get(req, 'Committee')
        data.committee = await committeeData.getAll()

        for (var role of data.committee) role.member.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: role.member.img })

        logger.info(`Session '${req.sessionID}': Getting Committee`)
        res.render('committee', data)
    },

    async constitution(req, res) {
        var data = await viewData.get(req, 'Constitution')

        logger.info(`Session '${req.sessionID}': Getting Constitution`)
        res.render('constitution', data)
    }
}

module.exports = about