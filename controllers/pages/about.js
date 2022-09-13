'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const helper = require('../helper.js')
const committeeData = require('../../data_managers/committee.js')

const about = {
    async historyPage(req, res) {
        var data = await helper.viewData(req, 'About Us')
        res.render('about', data)
    },

    async committeePage(req, res) {
        var data = await helper.viewData(req, 'Committee')
        data.committee = await committeeData.getAll()

        // Since the images come from the committee call and not view data, the images still need to be resolved
        for (var role of data.committee) role.member.img = s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: role.member.img })
        res.render('committee', data)
    },

    async constitutionPage(req, res) {
        var data = await helper.viewData(req, 'Constitution')
        res.render('constitution', data)
    }
}

module.exports = about