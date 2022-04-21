'use strict'

// Imports
const logger = require('./log.js')
const members = require('./data_managers/witkc_members.js')
const viewData = require('./view_data.js')
const certificates = require('./data_managers/certificates.js')
const committee = require('./data_managers/committee.js')


const api = {
    async existsUsername(req, res) {
        try {
            if (req.params.username.match(/^[\w-]{1,16}$/)) {
                logger.info(`API Request: Username Check`)
                if (await members.resolveUsername(req.params.username) === null) res.status(200).json(false)
                else res.status(200).json(true)
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err); console.log(err) }
    },

    async getCookie(req, res) {
        try {
            if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
            else res.status(200).json({ allow_cookies: false })
        } catch (err) { res.status(500).json(err) }
    },

    async postCookie(req, res) {
        try {
            if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {
                if (req.body.allow_cookies == 'true') req.session.allow_cookies = true
                res.sendStatus(200)
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err) }
    },

    async getMembers(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (data.committee || data.admin) {
                    members.list().then((mems) => {
                        if (mems !== null) res.status(200).json(mems)
                        else throw 'Failed to retrieve members!'
                    }).catch((err) => res.status(500).json(err))
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async getSafetyBoaters(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                members.list().then((mems) => {
                    if (mems !== null) res.status(200).json(mems)
                    else throw 'Failed to retrieve members!'
                }).catch((err) => res.status(500).json(err))
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async getMember(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (data.committee || data.admin) {
                    if (req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                        members.get(req.body.memberId).then((member) => {
                            if (member !== null) res.status(200).json(member)
                            else throw 'Failed to retrieve member!'
                        }).catch((err) => res.status(500).json(err))
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async getCerts(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (data.committee || data.admin) {
                    certificates.list().then((certs) => {
                        if (certs !== null) res.status(200).json(certs)
                        else throw 'Failed to get certificates!'
                    }).catch((err) => res.status(500).json(err))
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },
}

module.exports = api