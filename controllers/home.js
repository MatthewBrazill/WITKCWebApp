'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/witkc_members.js')

const home = {
    async get(req, res) {
        var viewData = {
            title: 'Home',
            language_dropdown: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/language_dropdown.js' }),
            witkc_img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_logo.png' }),
            logged_in: false
        }

        if (req.session.userID != undefined) {
            if (await members.exists(req.session.userID)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = await members.get(req.session.userID)
                viewData.logged_in = true
                viewData.member = member
                viewData.member.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: member.img })
            }
        }
        logger.info(`Session '${req.sessionID}': Getting Home`)
        res.render('home', viewData)
    }
}

module.exports = home