'use strict'

// Imports
const logger = require('../log.js')
const fs = require('fs')

const certificates = {
    async get(certId) {
        try {
            if (certId == null || certId == undefined) throw `Received invalid certificate ID!`
            const certs = JSON.parse(fs.readFileSync('./data_managers/certificates.json'))
            for (var cert of certs) if (cert.id == certId) return cert
            throw `Certificate ID not found!`
        } catch (err) {
            logger.warn(`Failed to get certificate ${certId}! ${err}`)
            return null
        }
    },

    async list() {
        try {
            const certs = JSON.parse(fs.readFileSync('./data_managers/certificates.json'))
            var res = []
            for (var cert of certs) res.push({
                id: cert.id,
                name: cert.name,
            })
            return res
        } catch (err) {
            logger.warn(`Failed to get certificates! ${err}`)
            return null
        }
    }
}

module.exports = certificates