'use strict'

// Imports
const fs = require('fs')

const sessions = {
    create(sessionId, userId) {
        var sessions = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/sessions.json"))
        sessions.push({
            sessionId: sessionId,
            userId: userId
        })
        fs.writeFileSync(__dirname + "/../data_stores/sessions.json", JSON.stringify(sessions))
        setTimeout(() => this.destroy(sessionId), 300000)
    },

    includes(sessionId) {
        var sessions = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/sessions.json"))
        for (var session of sessions) {
            if (session.sessionId == sessionId) return true
        }
        return false
    },

    destroy(sessionId) {
        var sessions = JSON.parse(fs.readFileSync(__dirname + "/../data_stores/sessions.json"))
        for (var session in sessions) {
            if (session.sessionId == sessionId && sessions.indexOf(session) > 0) sessions.splice(sessions.indexOf(session), 1)
        }
        fs.writeFileSync(__dirname + "/../data_stores/sessions.json", JSON.stringify(sessions))
    }
}

module.exports = sessions