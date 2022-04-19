$(document).ready(() => {


    $('#expense_form').submit((event) => {
        event.preventDefault()
        const form = $('#expense_form')
        const inputs = $("form#expense_form input")

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
            var data = new FormData()

            $("form#expense_form input[type != number]").each((index, element) => {
                var input = $(element)
                if (input.attr('type') == 'file') {
                    for (var i in input[0].files) data.append(`receipt-${i}`, input[0].files[i])
                } else data.append(`expense%${index}`, `${input.val()}%${$("form#expense_form input[type = number]").eq(index).val()}`)
            })

            $.ajax({
                url: '/api/expenses/submit',
                method: 'POST',
                contentType: false,
                processData: false,
                enctype: 'multipart/form-data',
                data: data,
                success: () => form.attr('class', 'ui success form'),
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#bio').on('input',)

    $('#add').click(() => {
        const button = $('#add')

        var element = $('<div class="ui fields"></div>')
            .append($('<div class="eleven wide field"></div>')
                .append($('<input type="text" placeholder="Purchase Description">').on('input', function() {
                    const desc = $(this)
                    const field = desc.parent()

                    if (!desc.val().match(/^.{1,32}$/u)) {
                        field.attr('class', 'eleven wide error field')
                        desc.prop('valid', false)
                    } else {
                        field.attr('class', 'eleven wide success field')
                        desc.prop('valid', true)
                    }
                })))
            .append($('<div class="five wide field"></div>')
                .append($('<div class="ui icon input"></div>')
                    .append($('<input type="number" min="0" step="any" placeholder="Price">').on('input', function() {
                        const price = $(this)
                        const field = price.parent().parent()

                        if (!price.val().match(/^\d+([,.]\d+)?$/)) {
                            field.attr('class', 'five wide error field')
                            price.prop('valid', false)
                        } else {
                            field.attr('class', 'five wide success field')
                            price.prop('valid', true)
                        }
                    }))
                    .append($('<i class="euro sign icon"></i>'))))
        element.insertBefore(button)
    })
    $('#add').trigger('click')

    $('#remove').click(() => {
        const button = $('#remove')
        if (button.prev().prev().prev().length == 1) button.prev().prev().remove()
    })

    $('#receipts').on('change', () => {
        const receipts = $('#receipts')
        const field = receipts.parent()
        var valid = true

        if (receipts.prop('files').length == 0) valid = false
        else for (var receipt of receipts.prop('files')) {
            if (receipt.type.split('/')[0] != 'image') valid = false
        }

        if (!valid) {
            field.attr('class', 'error field')
            receipts.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            receipts.prop('valid', true)
        }
    })
})