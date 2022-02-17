'use strict'

const fs = require('fs')
const logger = require('../log.js')

const passwords = {
    create(password) {
        var passwords = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/passwords.json"))
        passwords.push(password)
        logger.info(`Password Saved`)
        fs.writeFileSync(__dirname + "/../data_stores/passwords.json", JSON.stringify(passwords))
        return true
    },

    get(memberId) {
        var passwords = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/passwords.json"))
        logger.info(`Getting Password for User '${memberId}'`)
        for (var password of passwords) {
            if (password.memberId == memberId) return password.hash
        }
        return null
    },

    update(memberId, hash) {
        var passwords = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/passwords.json"))
        logger.info(`Updating Password for User '${memberId}'`)
        for (var password of passwords) {
            if (password.memberId == memberId && passwords.indexOf(password) > 0) {
                passwords[passwords.indexOf(password)].hash = hash
                fs.writeFileSync(__dirname + "/../data_stores/passwords.json", JSON.stringify(passwords))
                logger.info(`Password Updated`)
                return true
            }
        }
        fs.writeFileSync(__dirname + "/../data_stores/passwords.json", JSON.stringify(passwords))
        logger.warn(`Password Update Failed`)
        return false
    },

    delete(memberId) {
        var passwords = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/passwords.json"))
        logger.info(`Deleting Password for User '${memberId}'`)
        for (var password of passwords) {
            if (password.memberId == memberId && passwords.indexOf(password) > 0) {
                passwords.splice(passwords.indexOf(password), 1)
                fs.writeFileSync(__dirname + "/../data_stores/passwords.json", JSON.stringify(passwords))
                logger.info(`Password Deleted`)
                return true
            }
        }
        fs.writeFileSync(__dirname + "/../data_stores/passwords.json", JSON.stringify(passwords))
        logger.warn(`Password Delete Failed`)
        return false
    }
}

module.exports = passwords