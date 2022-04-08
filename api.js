'use strict'

// Imports
const logger = require('./log.js')
const members = require('./data_managers/witkc_members.js')
const viewData = require('./view_data.js')
const certificates = require('./data_managers/certificates.js')


const api = {
    async existsUsername(req, res) {
        try {
            if (!req.body.username.match(/^[\w-]{1,16}$/)) {
                logger.info(`API Request: Username Check`)
                if (members.resolveUsername(req.param.username) === null) res.status(200).send('false')
                else res.status(200).send('true')
            } else res.status(400)
        } catch (err) { res.status(500).send(err) }
    },

    async getCookie(req, res) {
        try {
            if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
            else res.status(200).json({ allow_cookies: false })
        } catch (err) { res.status(500).send(err) }
    },

    async postCookie(req, res) {
        try {
            if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {
                if (req.body.allow_cookies == 'true') req.session.allow_cookies = true
                res.sendStatus(200)
            } else res.sendStatus(400)
        } catch (err) { res.status(500).send(err) }
    },

    async getMembers(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(data.member.committeeRole)) {
                    members.list().then((mems) => {
                        if (mems !== null) res.status(200).json(mems)
                        else throw ''
                    }).catch((err) => res.status(500).send(err))
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).send(err) }
    },

    async getMember(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(data.member.committeeRole)) {
                    members.get(req.body.memberId).then((member) => {
                        if (member !== null) res.status(200).json(member)
                        else throw ''
                    }).catch((err) => res.status(500).send(err))
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).send(err) }
    },

    async getCerts(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(data.member.committeeRole)) {
                    certificates.list().then((certs) => {
                        if (certs !== null) res.status(200).json(certs)
                        else throw ''
                    }).catch((err) => res.status(500).send(err))
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).send(err) }
    }
}

module.exports = api