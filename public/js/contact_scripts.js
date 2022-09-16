$(document).ready(() => {

    // Event handlers for the contact form
    $('#contact_form').submit((event) => {
        event.preventDefault()
        const form = $('#contact_form')
        const inputs = $("form#contact_form input[type!=button], textarea")
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
                url: '/api/message/send',
                method: 'POST',
                data: data,
                success: () => {
                    form.attr('class', 'ui success form')
                    inputs.each((index, element) => {
                        $(element).parent().removeClass('success')
                        $(element).val('')
                    })
                },
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#firstName').on('input change', () => {
        const name = $('#firstName')
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            name.prop('valid', false)
            name.parent().attr('class', 'field error')
        } else {
            name.prop('valid', true)
            name.parent().attr('class', 'field success')
        }
    })

    $('#lastName').on('input change', () => {
        const name = $('#lastName')
        if (!name.val().match(/^\p{L}{1,16}$/u)) {
            name.prop('valid', false)
            name.parent().attr('class', 'field error')
        } else {
            name.prop('valid', true)
            name.parent().attr('class', 'field success')
        }
    })

    $('#email').on('input change', () => {
        const email = $('#email')
        if (!email.val().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) {
            email.prop('valid', false)
            email.parent().attr('class', 'field error')
        } else {
            email.prop('valid', true)
            email.parent().attr('class', 'field success')
        }
    })

    $('#message').on('input change', () => {
        const message = $('#message')
        if (!message.val().match(/^[^<>]{1,500}$/u)) {
            message.prop('valid', false)
            message.parent().attr('class', 'field error')
        } else {
            message.prop('valid', true)
            message.parent().attr('class', 'field success')
        }
    })
})