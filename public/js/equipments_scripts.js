$(document).ready(() => {

    $('#add_equipment').click(() => {
        $('#gear_form').attr('class', 'ui form')
        $('#add_equipment_modal').modal({
            onApprove: () => false,
            onDeny: () => false
        }).modal('show')
    })

    $('#add_equipment_modal_add').click(() => {
        const form = $('#gear_form')
        const file = $('#file')
        const inputs = $("form#gear_form input")

        var valid = true
        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            if (input.attr('id').split('_')[0] == $('#type').val() || input.attr('id') == 'gearName' || input.attr('id') == 'brand' || input.attr('id') == 'file') {
                if (!input.prop('valid')) valid = false
            }
        })

        if (valid) {
            form.attr('class', 'ui loading form')
            var data = new FormData()

            inputs.each((index, element) => {
                var input = $(element)
                if (input.attr('id').includes($('#type').val()) || input.attr('id') == 'type' || input.attr('id') == 'gearName' || input.attr('id') == 'brand') {
                    data.append(input.attr('id'), input.val())
                }
                if (input.attr('id') == 'file') data.append('file', file[0].files[0])
            })

            $.ajax({
                url: '/api/equipment/create',
                method: 'POST',
                contentType: false,
                processData: false,
                enctype: 'multipart/form-data',
                data: data,
                success: () => $('#add_equipment_modal').modal('hide'),
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#add_equipment_modal_cancel').click(() => {
        $('#add_equipment_modal').modal('hide')
    })

    $('#paddle_length').on('input change', () => {
        const length = $('#paddle_length')
        const field = length.parent()
        if (length.val() < 0 || length.val() > 1000 || length.val() == '') {
            field.attr('class', 'inline field error')
            length.prop('valid', false)
        } else {
            field.attr('class', 'inline field success')
            length.prop('valid', true)
        }
    })

    $('#gearName').on('input change', () => {
        const name = $('#gearName')
        const field = name.parent()
        if (!name.val().match(/^[\w- ]{1,24}$/)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#brand').on('input change', () => {
        const brand = $('#brand')
        const field = brand.parent()
        if (!brand.val().match(/^[\w- ]{1,24}$/)) {
            field.attr('class', 'field error')
            brand.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            brand.prop('valid', true)
        }
    })

    $('#file').on('input change', () => {
        const file = $('#file')
        const field = file.parent()

        if (file.prop('files')[0] == undefined) {
            field.attr('class', 'field')
            file.prop('valid', true)
        } else if (file.prop('files')[0].type.split('/')[0] != 'image') {
            field.attr('class', 'error field')
            file.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            file.prop('valid', true)
        }
    })

    $('.add_equipments_modal_dropdown').dropdown()
    $('.add_equipments_modal_dropdown_input').change(function () {
        const dropdown = $(this)

        if (dropdown.val() == null || dropdown.val() == '') {
            dropdown.prop('valid', false)
            dropdown.parent().parent().attr('class', 'field error')
        } else {
            dropdown.prop('valid', true)
            dropdown.parent().parent().attr('class', 'field success')
        }
    })

    $('.delete_gear').click(function () {
        const button = $(this)
        const card = button.parent().parent().parent()

        button.addClass('loading')
        $.ajax({
            url: '/api/equipment/delete',
            method: 'POST',
            data: { equipmentId: card.attr('id') },
            success: () => card.remove(),
            error: () => button.removeClass('loading')
        })
    })

    $('#type').on('input change', () => {
        const type = $('#type')

        $('#boat_fields').hide()
        $('#paddle_fields').hide()
        $('#deck_fields').hide()
        $('#ba_fields').hide()
        $('#helmet_fields').hide()
        $('#wetsuit_fields').hide()

        switch (type.val()) {
            case "boat":
                $('#boat_fields').show()
                break;

            case "paddle":
                $('#paddle_fields').show()
                break;

            case "deck":
                $('#deck_fields').show()
                break;

            case "ba":
                $('#ba_fields').show()
                break;

            case "helmet":
                $('#helmet_fields').show()
                break;

            case "wetsuit":
                $('#wetsuit_fields').show()
                break;
        }
    })
})