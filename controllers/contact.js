'use strict'

const contact = {
    get(req, res) {
        const viewData = {
            title: 'Contact Us'
        }
        res.render('contact', viewData)
    }
}

module.exports = contact