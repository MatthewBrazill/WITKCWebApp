'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const fs = require('fs')
const formidable = require('formidable')
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')
const passwords = require("../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const sharp = require('sharp')
const viewData = require('../view_data.js')
const committee = require('../data_managers/committee.js')

const profile = {
    async me(req, res) {
        var data = await viewData.get(req, 'My Profile')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        if (data.logged_in) {
            if (data.committee) {
                data.scripts.committee = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/committee_scripts.js' })
                data[data.committee] = await committee.getRole(data.committee)
                data.scripts[data.committee] = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: `js/${data.committee}_scripts.js` })
            } else if (data.admin) {
                data.scripts.committee = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/committee_scripts.js' })
                for (var role of ['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers']) {
                    data[role] = await committee.getRole(role)
                    data.scripts[role] = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: `js/${role}_scripts.js` })
                }
            }

            logger.info(`Session '${req.sessionID}': Getting Profile`)
            res.render('profile', data)
        } else res.redirect('/')
    },

    async settings(req, res) {
        var data = await viewData.get(req, 'Settings')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        if (data.logged_in) {
            if (data.member.committeeRole == 'admin') data.admin = true
            logger.info(`Session '${req.sessionID}': Getting Settings`)
            res.render('settings', data)
        } else res.redirect('/')
    },

    async personal(req, res) {
        try {
            var data = await viewData.get(req, 'Personal')

            if (data.logged_in) {
                var valid = true
                var counties = [
                    'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
                    'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
                    'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
                    'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
                ]

                // Server-Side Validation
                if (!req.body.first_name.match(/^\p{L}{1,16}$/u)) valid = false
                if (!req.body.last_name.match(/^\p{L}{1,16}$/u)) valid = false
                if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) valid = false
                if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
                if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
                if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
                if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                if (!counties.includes(req.body.county)) valid = false
                if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false

                if (valid) {
                    members.update({
                        memberId: data.member.memberId,
                        firstName: viewData.capitalize(req.body.first_name),
                        lastName: viewData.capitalize(req.body.last_name),
                        email: req.body.email.toLowerCase(),
                        phone: viewData.internationalize(req.body.phone),
                        address: {
                            lineOne: viewData.capitalize(req.body.line_one),
                            lineTwo: viewData.capitalize(req.body.line_two),
                            city: viewData.capitalize(req.body.city),
                            county: req.body.county,
                            code: req.body.code.toUpperCase().replace(/\s/g, '')
                        },
                        promotion: (req.body.promotion === 'true')
                    }).then(() => {
                        logger.info(`Member ${data.member.memberId}: Successfully changed personal data!`)
                        res.sendStatus(200)
                    }).catch(() => res.status(500).json(err))
                } else res.sendStatus(400)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async customize(req, res) {
        try {
            var data = await viewData.get(req, 'Customize')

            if (data.logged_in) {
                var form = new formidable.IncomingForm()
                new Promise((resolve, reject) => {
                    form.parse(req, (err, fields, files) => {
                        var valid = true
                        if (err) reject(err)
                        else {
                            if (!fields.bio.match(/^[^<>]{1,500}$/u)) valid = false
                            if (files.file.type.split('/')[0] != 'image') valid = false

                            if (!valid) reject('Malformed Input')
                            else resolve(fields, files)
                        }
                    })
                }).then(async (fields, files) => {
                    if (files !== undefined) {
                        await sharp(files.file.filepath).resize({ width: 400 }).webp().toFile(`${files.file.filepath}-new`).catch((err) => { throw err })
                        await s3.putObject({
                            Bucket: 'witkc',
                            Key: data.member.img,
                            Body: fs.readFileSync(`${files.file.filepath}-new`)
                        }).promise().catch((err) => { throw err })
                    }

                    members.update({
                        memberId: data.member.memberId,
                        bio: fields.bio
                    })
                    logger.info(`Member ${data.member.memberId}: Successfully updated image!`)
                    res.status(200).json({
                        url: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.member.img })
                    })
                }).catch((err) => { res.status(500).json(err) })
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async password(req, res) {
        try {
            var data = await viewData.get(req, 'Password')

            if (data.logged_in) {
                if (await bcrypt.compare(req.body.old_password, await passwords.get(data.member.memberId))) {
                    var valid = true
                    // Server-Side Validation
                    if (req.body.new_password.length < 8) valid = false
                    if (req.body.confirm_password != req.body.new_password) valid = false

                    if (valid) {
                        passwords.update(data.member.memberId, await bcrypt.hash(req.body.new_password, 10)).then(() => {
                            logger.info(`Member ${data.member.memberId}: Successfully changed password!`)
                            res.sendStatus(200)
                        }).catch(() => res.status(500).json(err))
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async delete(req, res) {
        try {
            var data = await viewData.get(req, 'Delete')

            if (data.logged_in && req.body.delete) {
                members.delete(data.member.memberId).then(() => {
                    res.redirect('/logout')
                    logger.info(`Member ${data.member.memberId}: Successfully deleted account!`)
                }).catch(() => res.status(500).json(err))
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async user(req, res) {
        var data = await viewData.get(req, 'View Profile')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        if (data.logged_in) {
            if (req.params.userId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {

                data.user = await members.get(req.params.userId)
                data.user.dateJoined = new Date(data.user.dateJoined).toUTCString().substring(5, 16)
                data.user.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.user.img })

                logger.info(`Session '${req.sessionID}': Getting View Profile`)
                res.render('view_profile', data)
            } else res.redirect('/404')
        } else res.redirect('/')
    },
}

module.exports = profile