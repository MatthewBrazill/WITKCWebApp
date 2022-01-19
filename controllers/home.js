'use strict'

const home = {
    index(req, res) {
        const viewData = {
            title: 'Home'
        }
        res.render('home', viewData)
    }
}

module.exports = home