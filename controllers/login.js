'use strict'

const login = {
    index(req, res) {
        const viewData = {
            title: 'Login'
        }
        res.render('login', viewData)
    }
}

module.exports = login