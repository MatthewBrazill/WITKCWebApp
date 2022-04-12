'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('./log.js')
const members = require('./data_managers/witkc_members')
const committee = require('./data_managers/committee.js')

const viewData = {
    async get(req, title) {
        var data = {
            title: title,
            scripts: {
                global: '/global_scripts.js' //s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/global_scripts.js' }),
            },
            witkc_logo: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_logo.webp' }),
            witkc_icon: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_icon.ico' }),
            logged_in: false
        }

        if (await members.exists(req.session.userID)) {
            logger.debug(`Session '${req.sessionID}' is Logged In`)

            data.member = await members.get(req.session.userID)
            data.logged_in = true

            if (data.member.memberId == '96e01799-74bb-4772-bd5c-fd92528cc510') data.admin = true
            else data.committee = committee.isCommittee(data.member.memberId).then((role) => role)

            if (req.method != 'POST') {
                data.member.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.member.img })
            }
        }

        return data
    },

    capitalize(text) {
        var words = text.split(' ')
        for (var i in words) words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        return words.join(' ')
    },

    internationalize(number) {
        if (number.charAt(0) == '0') return '+353' + number.slice(1)
        else return number
    }
}

module.exports = viewData