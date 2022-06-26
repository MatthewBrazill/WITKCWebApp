$(document).ready(() => {
    $('.announcement_button').click(function () {
        $('#announcement_form').attr('class', 'ui form')
        $('#announcement_modal').modal({
            onApprove: () => false,
            onDeny: () => false
        }).modal('show')
    })

    $('#announcement_modal_create').click(() => {
        const form = $('#announcement_form')
        const inputs = $("form#announcement_form input[type!=button], form#announcement_form textarea")

        var valid = true
        inputs.trigger('input')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (valid) {
            form.attr('class', 'ui loading form')
            var data = {}

            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })

            $.ajax({
                url: '/api/committee/announcement/create',
                method: 'POST',
                data: data,
                success: () => $('#announcement_modal').modal('hide'),
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#announcement_modal_cancel').click(() => {
        $('#announcement_modal').modal('hide')
    })

    $('#title').on('input', () => {
        const title = $('#title')
        const field = title.parent()

        if (!title.val().match(/^[\p{L}\d!?&() ]{1,64}$/u)) {
            field.attr('class', 'error field')
            title.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            title.prop('valid', true)
        }
    })

    $('#content').on('input', () => {
        const content = $('#content')
        const field = content.parent()

        if (!content.val().match(/^[^<>]{1,500}$/u)) {
            field.attr('class', 'error field')
            content.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            content.prop('valid', true)
        }
    })
})