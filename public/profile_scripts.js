$(document).ready(() => {

    // Code for the settings menu
    $('.tabular.menu .item').tab()

    $('#personal').on('click', () => {
        $('#personal').addClass('active')
        $('#customize').removeClass('active')
        $('#password').removeClass('active')
        $.tab('change tab', 'personal')
    })

    $('#customize').on('click', () => {
        $('#customize').addClass('active')
        $('#personal').removeClass('active')
        $('#password').removeClass('active')
        $.tab('change tab', 'customize')
    })

    $('#password').on('click', () => {
        $('#password').addClass('active')
        $('#customize').removeClass('active')
        $('#personal').removeClass('active')
        $.tab('change tab', 'password')
    })





    // Event handlers for the personal form
    $('#personal_form').submit((event) => {
        event.preventDefault()
        const form = $('#personal_form')
        const inputs = $("form#personal_form input[type!=button][class!=search]")
        var valid = true

        inputs.trigger('change')
        inputs.trigger('input')
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
                url: '/profile/me/settings/personal',
                method: 'POST',
                data: data,
                success: () => form.attr('class', 'ui success form'),
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#first_name').on('input', () => {
        const name = $('#first_name')
        const field = name.parent()
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#last_name').on('input', () => {
        const name = $('#last_name')
        const field = name.parent()
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#email').on('input', () => {
        const email = $('#email')
        const field = email.parent()
        if (!email.val().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)) {
            field.attr('class', 'field error')
            email.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            email.prop('valid', true)
        }
    })

    $('#phone').on('input', () => {
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

    $('#line_one').on('input', () => {
        const line = $('#line_one')
        const field = line.parent()
        if (!line.val().match(/^[\w- ]{1,32}$/)) {
            field.attr('class', 'field error')
            line.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            line.prop('valid', true)
        }
    })

    $('#line_two').on('input', () => {
        const line = $('#line_two')
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

    $('#city').on('input', () => {
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
    $('#county').on('change', () => {
        const county = $('#county')
        const field = county.parent().parent()
        var counties = [
            'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
            'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
            'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
            'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
        ]

        if (!county.val() in counties) {
            field.attr('class', 'ten wide field error')
            county.prop('valid', false)
        } else {
            field.attr('class', 'ten wide field success')
            county.prop('valid', true)
        }
    })

    $('#code').on('input', () => {
        const code = $('#code')
        const field = code.parent()
        if (!code.val().match(/^[a-zA-Z0-9]{3}[ ]?[a-zA-Z0-9]{4}$/)) {
            field.attr('class', 'six wide field error')
            code.prop('valid', false)
        } else {
            field.attr('class', 'six wide field success')
            code.prop('valid', true)
        }
    })





    // Event handlers for the customize form
    $('#customize_form').submit((event) => {
        event.preventDefault()
        const form = $('#customize_form')
        const file = $('#file')[0].files[0]
        const inputs = $("form#customize_form input[type=file]")

        var valid = true
        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            console.log(index, input.attr('id'), input.prop('valid'))
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.attr('class', 'ui loading form')
            var data = new FormData()
            data.append('file', file)
            $.ajax({
                url: '/profile/me/settings/customize',
                method: 'POST',
                contentType: false,
                processData: false,
                enctype: 'multipart/form-data',
                data: data,
                success: (res) => {
                    form.attr('class', 'ui success form')
                    $('#image').attr('src', 'https://picsum.photos/200')
                },
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#file').on('change', () => {
        const file = $('#file')
        const field = file.parent()

        if (file.prop('files')[0] == undefined) {
            field.attr('class', 'error field')
            file.prop('valid', false)
        } else if (file.prop('files')[0].type.split('/')[0] != 'image') {
            field.attr('class', 'error field')
            file.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            file.prop('valid', true)
        }
    })





    // Event handlers for the password form
    $('#password_form').submit((event) => {
        event.preventDefault()
        const form = $('#password_form')
        const inputs = $("form#password_form input[type=password]")
        var valid = true

        inputs.trigger('input')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.addClass('loading')
            var data = {}
            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })
            $.ajax({
                url: '/profile/me/settings/password',
                method: 'POST',
                data: data,
                success: () => {
                    form.attr('class', 'ui success form')
                    inputs.each((index, element) => $(element).val(''))
                },
                error: () => {
                    form.attr('class', 'ui error form')
                    inputs.each((index, element) => $(element).val(''))
                }
            })
        }
    })

    $('#old_password').on('input', () => {
        const password = $('#old_password')

        if (password.val() == '') {
            password.parent().parent().addClass('error')
            password.prop('valid', false)
        } else {
            password.parent().parent().removeClass('error')
            password.prop('valid', true)
        }
    })

    $('#new_password').on('input', () => {
        const password = $('#new_password')
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

    $('#confirm_password').on('input', () => {
        const confirm_password = $('#confirm_password')

        if (confirm_password.val() != $('#new_password').val() || confirm_password.val() == '') {
            confirm_password.parent().attr('class', 'error field')
            confirm_password.prop('valid', false)
        } else {
            confirm_password.parent().attr('class', 'success field')
            confirm_password.prop('valid', true)
        }
    })

    $('#hide_old_password').on('focus', () => $('#new_password').focus())
    $('#hide_old_password').click(() => {
        const password = $('#old_password')

        if (password.attr('type') == 'password') {
            password.attr('type', 'text')
            password.siblings().attr('class', 'eye icon')

        } else {
            password.attr('type', 'password')
            password.siblings().attr('class', 'eye slash icon')
        }
        password.focus()
    })

    $('#hide_new_password').on('focus', () => $('#confirm_password').focus())
    $('#hide_new_password').click(() => {
        const password = $('#new_password')
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