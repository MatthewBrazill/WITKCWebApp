'use strict'

// Imports
const logger = require('./log.js')
const members = require('./data_managers/witkc_members.js')
const viewData = require('./view_data.js')
const certificates = require('./data_managers/certificates.js')


const api = {
    async existsUsername(req, res) {
        logger.info(`API Request: Username Exists`)
        if (members.resolveUsername(req.param.username) === null) res.send('false')
        else res.send('true')
    },

    async getCookie(req, res) {
        if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
        else res.status(200).json({ allow_cookies: false })
    },

    async postCookie(req, res) {
        console.log(req.body)
        if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {
            if (req.body.allow_cookies == 'true') req.session.allow_cookies = true
            res.sendStatus(200)
        } else {
            res.sendStatus(400)
        }
    },

    async getMembers(req, res) {
        var data = await viewData.get(req, 'API')

        if (data.logged_in) {
            if (await members.isCommittee(data.member.memberId)) {
                members.list().then((mems) => {
                    if (mems !== null) res.status(200).json(mems)
                    else throw ''
                }).catch(() => res.sendStatus(500))
            } else res.sendStatus(403)
        } else res.sendStatus(403)
    },

    async getMember(req, res) {
        var data = await viewData.get(req, 'API')

        if (data.logged_in) {
            if (await members.isCommittee(data.member.memberId)) {
                members.get(req.body.memberId).then((member) => {
                    if (member !== null) res.status(200).json(member)
                    else throw ''
                }).catch(() => res.sendStatus(500))
            } else res.sendStatus(403)
        } else res.sendStatus(403)
    },

    async getCerts(req, res) {
        var data = await viewData.get(req, 'API')

        if (data.logged_in) {
            if (await members.isCommittee(data.member.memberId)) {
                certificates.list().then((certs) => {
                    if (certs !== null) res.status(200).json(certs)
                    else throw ''
                }).catch(() => {
                    res.sendStatus(500)
                })
            } else res.sendStatus(403)
        } else res.sendStatus(403)
    }
}

module.exports = api