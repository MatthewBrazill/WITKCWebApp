'use strict'

const home = {
    index(req, res) {
        const viewData = {
            title: 'Home',
            logged_in: true
        }
        res.render('home', viewData)
    }
}

module.exports = home