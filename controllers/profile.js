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
const viewData = require('../view_data.js')

const profile = {
    async me(req, res) {
        var data = await viewData.get(req, 'My Profile')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        if (data.logged_in) {
            logger.info(`Session '${req.sessionID}': Getting Profile`)
            res.render('profile', data)
        } else res.redirect('/')
    },

    async settings(req, res) {
        var data = await viewData.get(req, 'Settings')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        if (data.logged_in) {
            logger.info(`Session '${req.sessionID}': Getting Settings`)
            res.render('settings', data)
        } else res.redirect('/')
    },

    async personal(req, res) {
        var data = await viewData.get(req, 'Personal')
        var valid = true
        var counties = [
            'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
            'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
            'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
            'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
        ]

        console.log(req.body)
        if (data.logged_in) {
            // Server-Side Validation
            if (!req.body.first_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.last_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)) valid = false
            if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
            if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
            if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
            if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
            if (!req.body.county in counties) valid = false
            if (!req.body.code.match(/^[a-zA-Z0-9]{3}[ ]?[a-zA-Z0-9]{4}$/)) valid = false

            if (valid) {
                data.member.firstName = req.body.first_name
                data.member.lastName = req.body.last_name
                data.member.email = req.body.email
                data.member.phone = req.body.phone
                data.member.address.lineOne = req.body.line_one
                data.member.address.lineTwo = req.body.line_two
                data.member.address.city = req.body.city
                data.member.address.county = req.body.county
                data.member.address.code = req.body.code
                console.log(data.member)
                if (await members.update(data.member)) res.sendStatus(200)
                else res.sendStatus(500)
            } else res.sendStatus(400)
        } else res.sendStatus(403)
    },

    async customize(req, res) {
        var data = await viewData.get(req, 'Customize')
        var file = new formidable.IncomingForm()

        if (data.logged_in) {
            new Promise((resolve) => {
                file.parse(req, (err, fields, file) => {
                    if (err) res.status(400).json({ err: err })
                    else resolve(file.file)
                })
            }).then((file) => {
                data.member.img = `img/users/${data.member.memberId}.${file.originalFilename.split('.').pop()}`
                s3.putObject({
                    Bucket: 'witkc',
                    Key: data.member.img,
                    Body: fs.readFileSync(file.filepath)
                }).promise()
            }).then(() => {
                members.update(data.member)
                logger.info(`User ${data.member.memberId}: Successfully updated image!`)
                res.status(200).json({
                    url: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.member.img })
                })
            }).catch((err) => {
                logger.warn(`User ${data.member.memberId}: Error while updating image! ${err}`)
                res.status(500).json({ err: err })
            })
        } else res.sendStatus(403)
    },

    async password(req, res) {
        var data = await viewData.get(req, 'Password')
        var valid = true

        if (data.logged_in) {
            if (await bcrypt.compare(req.body.old_password, await passwords.get(data.member.memberId))) {
                // Server-Side Validation
                if (req.body.new_password.length < 8) valid = false
                if (req.body.confirm_password != req.body.new_password) valid = false

                if (valid) {
                    if (await passwords.update(data.member.memberId, await bcrypt.hash(req.body.new_password, 10))) res.sendStatus(200)
                    else res.sendStatus(500)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
        } else res.sendStatus(403)
    },

    async user(req, res) {
        res.redirect('/')
    },
}

module.exports = profile