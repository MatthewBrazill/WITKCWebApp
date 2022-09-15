$(document).ready(() => {

    // Event handlers for sign up form
    $('#sign_up_form').submit((event) => {
        event.preventDefault()
        const form = $('#sign_up_form')
        const inputs = $("form#sign_up_form input[type!=button][class!=search]")
        var valid = true

        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.attr('class', 'ui loading form')
            var data = {}
            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })
            $.ajax({
                url: '/api/account/create',
                method: 'POST',
                data: data,
                success: (res) => window.location = res.url,
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#firstName').change(() => {
        const name = $('#firstName')
        const field = name.parent()
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#lastName').change(() => {
        const name = $('#lastName')
        const field = name.parent()
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#username').change(() => {
        const name = $('#username')
        const field = name.parent()
        if (!name.val().match(/^[\w-]{1,16}$/)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'loading field')
            $.ajax({
                url: `/api/members/resolve`,
                method: 'POST',
                data: { username: name.val() },
                success: () => {
                    field.attr('class', 'field success')
                    name.prop('valid', true)
                },
                error: () => {
                    field.attr('class', 'field error')
                    name.prop('valid', false)
                }
            })
        }
    })

    $('#email').change(() => {
        const email = $('#email')
        const field = email.parent()
        if (!email.val().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) {
            field.attr('class', 'field error')
            email.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            email.prop('valid', true)
        }
    })

    $('#phone').change(() => {
        const phone = $('#phone')
        const field = phone.parent()
        if (phone.val() == '') {
            field.attr('class', 'field')
            phone.prop('valid', true)
        } else if (!phone.val().match(/^[+0]+\d{8,12}$/)) {
            field.attr('class', 'field error')
            phone.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            phone.prop('valid', true)
        }
    })

    $('#lineOne').change(() => {
        const line = $('#lineOne')
        const field = line.parent()
        if (!line.val().match(/^[\w- ]{1,32}$/)) {
            field.attr('class', 'field error')
            line.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            line.prop('valid', true)
        }
    })

    $('#lineTwo').change(() => {
        const line = $('#lineTwo')
        const field = line.parent()
        if (line.val() == '') {
            field.attr('class', 'field')
            line.prop('valid', true)
        } else if (!line.val().match(/^[\w- ]{1,32}$/)) {
            field.attr('class', 'field error')
            line.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            line.prop('valid', true)
        }
    })

    $('#city').change(() => {
        const city = $('#city')
        const field = city.parent()
        if (!city.val().match(/^[\w- ]{1,32}$/)) {
            field.attr('class', 'field error')
            city.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            city.prop('valid', true)
        }
    })

    $('#county_dropdown').dropdown()
    $('#county').change(() => {
        const county = $('#county')
        const field = county.parent().parent()
        var counties = [
            'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
            'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
            'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
            'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
        ]

        if (!counties.includes(county.val())) {
            field.attr('class', 'ten wide field error')
            county.prop('valid', false)
        } else {
            field.attr('class', 'ten wide field success')
            county.prop('valid', true)
        }
    })

    $('#code').change(() => {
        const code = $('#code')
        const field = code.parent()
        if (!code.val().match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !code.val().match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) {
            field.attr('class', 'six wide field error')
            code.prop('valid', false)
        } else {
            field.attr('class', 'six wide field success')
            code.prop('valid', true)
        }
    })

    $('#password').change(() => {
        const password = $('#password')
        const field = password.parent().parent()
        const form = field.parent()
        const res = zxcvbn(password.val())

        var warn = 'Your password is weak!'
        var tips = ''

        if (password.val() == '') {
            password.prop('valid', false)
            field.attr('class', 'error field')
            form.attr('class', 'ui form')
        } else if (res.score < 3) {
            password.prop('valid', false)
            field.attr('class', 'error field')
            form.attr('class', 'ui warning form')

            // Build and set warning message
            if (res.feedback.warning != '') warn = `${warn} ${res.feedback.warning}:`
            $('#password_warning_header').text(warn)
            for (suggestion of res.feedback.suggestions) tips = `${tips} ${suggestion}<br style="padding: 0px 10px">`
            $('#password_warning').html(tips)
        } else if (res.score < 4) {
            password.prop('valid', true)
            field.attr('class', 'info field')
            form.attr('class', 'ui info form')
        } else if (res.score == 4) {
            password.prop('valid', true)
            field.attr('class', 'success field')
            form.attr('class', 'ui form')
        } else {
            password.prop('valid', false)
            field.attr('class', 'info field')
            form.attr('class', 'ui form')
        }
    })

    $('#confirm_password').change(() => {
        const confirm_password = $('#confirm_password')

        if (confirm_password.val() != $('#password').val() || confirm_password.val() == '') {
            confirm_password.parent().attr('class', 'error field')
            confirm_password.prop('valid', false)
        } else {
            confirm_password.parent().attr('class', 'success field')
            confirm_password.prop('valid', true)
        }
    })

    $('#terms').change(() => {
        const box = $('#terms')

        if (!box.prop('checked')) {
            box.parent().parent().attr('class', 'inline error field')
            box.prop('valid', false)
        } else {
            box.parent().parent().attr('class', 'inline success field')
            box.prop('valid', true)
        }
    })

    $('#privacy').change(() => {
        const box = $('#privacy')

        if (!box.prop('checked')) {
            box.parent().parent().attr('class', 'inline error field')
            box.prop('valid', false)
        } else {
            box.parent().parent().attr('class', 'inline success field')
            box.prop('valid', true)
        }
    })

    $('#hide_password').on('focus', () => $('#confirm_password').focus())
    $('#hide_password').click(() => {
        const password = $('#password')
        const confirm = $('#confirm_password')

        if (password.attr('type') == 'password') {
            password.attr('type', 'text')
            confirm.attr('disabled', true)
            password.siblings().attr('class', 'eye icon')

        } else {
            password.attr('type', 'password')
            confirm.attr('disabled', false)
            password.siblings().attr('class', 'eye slash icon')
        }
        password.focus()
    })
})