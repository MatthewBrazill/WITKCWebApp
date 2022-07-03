'use strict'

// Imports
const viewData = require('../../view_data.js')
const certificates = require('../../data_managers/certificates.js')


const api = {
    async list(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {
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