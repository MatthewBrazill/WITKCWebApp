'use strict'

// Imports
const logger = require('../../log.js')
const members = require('../../data_managers/witkc_members.js')
const viewData = require('../../view_data.js')


const api = {
    async reslove(req, res) {
        try {
            if (req.params.username.match(/^[\w-]{1,16}$/)) {
                logger.info(`API Request: Username Check`)
                if (await members.resolveUsername(req.params.username) === null) res.status(200).json(false)
                else res.status(200).json(true)
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err) }
    },

    async list(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.member.verified) {
                members.list().then((mems) => {
                    if (mems !== null) res.status(200).json(mems)
                    else throw 'Failed to retrieve members!'
                }).catch((err) => res.status(500).json(err))
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async get(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.committee || data.admin) {
                if (req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    members.get(req.body.memberId).then((member) => {
                        if (member !== null) res.status(200).json(member)
                        else throw 'Failed to retrieve member!'
                    }).catch((err) => res.status(500).json(err))
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = api