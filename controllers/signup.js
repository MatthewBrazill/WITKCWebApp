'use strict'

const signup = {
    index(req, res) {
        const viewData = {
            title: 'Sign Up'
        }
        res.render('signup', viewData)
    }
}

module.exports = signup