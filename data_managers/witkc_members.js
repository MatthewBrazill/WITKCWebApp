'use strict'

// Imports
const StatsD = require('hot-shots')
const datadog = new StatsD('localhost', 8125)
const logger = require('../log.js')
const fs = require('fs')

const members = {
    create(member) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        members.push(member)
        fs.writeFileSync(__dirname + "/../data_stores/members.json", JSON.stringify(members))
        datadog.increment('witkc.members.count')
        logger.info(`Member '${member.firstName} ${member.lastName}' Created`)
        return true
    },

    getWithUsername(username) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        for (var mem of members) {
            if (mem.username == username) return mem
        }
        return null
    },

    getWithId(memberId) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        for (var mem of members) {
            if (mem.memberId == memberId) return mem
        }
        return null
    },

    exists(memberId) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        for (var mem of members) {
            if (mem.memberId == memberId) return true
        }
        return false
    },

    update(member) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        for (var mem of members) {
            if (mem.memberId == member.memberId && members.indexOf(mem) > 0) {
                members[members.indexOf(mem)] = member
                fs.writeFileSync(__dirname + "/../data_stores/members.json", JSON.stringify(members))
                logger.info(`Member '${member.firstName} ${member.lastName}' Updated`)
                return true
            }
        }
        fs.writeFileSync(__dirname + "/../data_stores/members.json", JSON.stringify(members))
        logger.warn(`Member Update Failed`)
        return false
    },

    delete(memberId) {
        var members = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/members.json"))
        for (var mem in members) {
            if (mem.memberId == memberId && members.indexOf(mem) > 0) {
                members.splice(members.indexOf(mem), 1)
                fs.writeFileSync(__dirname + "/../data_stores/members.json", JSON.stringify(members))
                logger.info(`Member '${member.firstName} ${member.lastName}' Deleted`)
                return true
            }
        }
        fs.writeFileSync(__dirname + "/../data_stores/members.json", JSON.stringify(members))
        datadog.decrement('witkc.members.count')
        logger.warn(`Member Delete Failed`)
        return false
    }
}

module.exports = members