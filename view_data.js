'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('./log.js')
const members = require('./data_managers/witkc_members')

const viewData = {
    async get(req, title) {
        var data = {
            title: title,
            scripts: {
                global: 'global_scripts.js'//s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/global_scripts.js' }),
            },
            witkc_logo: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_logo.png' }),
            logged_in: false
        }

        if (await members.exists(req.session.userID)) {
            logger.debug(`Session '${req.sessionID}' is Logged In`)

            var member = members.get(req.session.userID)
            data.member = await member
            data.logged_in = true
            if (req.method != 'POST') {
                data.member.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.member.img })
            }
        }

        return data
    }
}

module.exports = viewData