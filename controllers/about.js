'use strict'

const about = {
    get(req, res) {
        const viewData = {
            title: 'About Us'
        }
        res.render('about', viewData)
    }
}

module.exports = about