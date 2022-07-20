'use strict'

// Imports
const logger = require('../../log.js')

const logout = {
    async logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
}

module.exports = logout