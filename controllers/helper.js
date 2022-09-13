'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/members')
const committee = require('../data_managers/committee.js')
const trips = require('../data_managers/trips.js')
const announcements = require('../data_managers/announcements.js')

const helper = {
    async viewData(req, title) {

        // Set the basic View Data
        var data = {
            title: title,
            scripts: {
                global: process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/global_scripts.js' : 'js/global_scripts.js' //s3.getSignedUrl('getObject', { Bucket: 'setukc', Key: 'js/global_scripts.js' })
            },
            setukcLogo: process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/img/witkc_logo.webp' : 'img/witkc_logo.webp',
            setukcIcon: process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/img/witkc_icon.ico' : 'img/witkc_icon.ico',
            loggedIn: false,
            env: process.env.DD_ENV
        }

        logger.debug({
            sessionId: req.sessionID,
            loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
            memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
            method: req.method,
            urlPath: req.url,
            message: `Set Basic View Data`
        })

        // Autheticate user and collect data
        if (req.session != undefined) {

            // Retrieve member
            data.member = await members.get(req.session.memberId)
            if (data.member != null) {
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Session Authenticated`
                })

                data.loggedIn = true
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Member Retrieved`
                })

                // Retrieve trips for this member
                data.member.trips = await trips.getAllFor(data.member.memberId)
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Trips Retrieved`
                })

                // Retrieve unread announcements for this member
                data.announcements = await announcements.getUnread(data.member.memberId)
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Unread Announcements Retrieved`
                })

                /* Some places need the Profile image to not be resolved to a sgned
                URL, as such any time the title is set to API, dont resolve the image. */
                if (title != 'API') {
                    data.member.img = s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: data.member.img })
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Profile Image Resolved`
                    })
                } else logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Profile Image NOT Resolved`
                })

                /* If the memberId matches this the user is admin => set admin flag
                
                If user is not admin, retrieve the committee status. Value is false
                if user is not in commitee and equal to the committeeId if they are. */
                if (data.member.memberId == '96e01799-74bb-4772-bd5c-fd92528cc510') {
                    data.admin = true
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Admin Session`
                    })
                } else data.committee = await committee.isCommittee(data.member.memberId).then((roleId) => roleId)
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Committee Status => ${data.committee}`
                })
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

module.exports = helper