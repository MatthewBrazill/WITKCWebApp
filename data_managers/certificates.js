'use strict'

// Imports
const logger = require('../log.js')
const fs = require('fs')

const certificates = {
    async get(certId) {
        try {
            // Validate input
            if (certId == null || certId == undefined) throw `Received invalid certificate ID!`

            // Load certificates file
            const certs = JSON.parse(fs.readFileSync('./data_managers/certificates.json'))

            for (var cert of certs) if (cert.id == certId) {
                logger.info({
                    certId: certId,
                    objectType: 'certificate',
                    storageType: 'json',
                    message: `Got Certificate`
                })
                return cert
            }

            throw `Certificate ID not found!`
        } catch (err) {
            logger.warn({
                certId: certId,
                objectType: 'certificate',
                storageType: 'json',
                error: err,
                stack: err.stack,
                message: `Failed To Get Certificate`
            })
            return null
        }
    },

    async list() {
        try {
            // Load certificates file
            const certs = JSON.parse(fs.readFileSync('./data_managers/certificates.json'))

            var res = []
            for (var cert of certs) res.push(cert)
            logger.info({
                objectType: 'certificate',
                storageType: 'json',
                message: `Listed Certificates`
            })
            return res
        } catch (err) {
            logger.warn({
                objectType: 'certificate',
                storageType: 'json',
                error: err,
                stack: err.stack,
                message: `Failed To Get Certificate`
            })
            return null
        }
    }
}

module.exports = certificates