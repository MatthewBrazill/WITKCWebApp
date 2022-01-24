'use strict'

const { post } = require("../routes")

const login = {
    get(req, res) {
        const viewData = {
            title: 'Login'
        }
        res.render('login', viewData)
    },

    post() {
        
    }
}

module.exports = login