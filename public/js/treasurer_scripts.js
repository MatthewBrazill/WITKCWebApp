$(document).ready(() => {

    $('.expenseRequest').click(function () {
        $('#expense_modal').modal({
            closeIcon: true,
            onApprove: () => false,
            onDeny: () => false
        }).modal('show')
        const request = $(this)
        const receipts = $('#expense_modal_receipts')
        const expenses = $('#expense_modal_expenses')
        const total = $('#expense_modal_total')
        receipts.html('')
        expenses.html('')

        $.ajax({
            url: '/api/expenses/get',
            method: 'POST',
            data: { expenseId: request.attr('id') },
            success: (expenseRequest) => {
                for (var receipt of expenseRequest.receipts) {
                    receipts.append($(`<img class="ui fluid rounded image" src="${receipt}" alt="Receipt"><br>`))
                }

                for (var expense of expenseRequest.expenses) {
                    expenses.append($('<div class="item"><div class="content"><div class="description"></div></div></div>')
                        .append($(`<div class="ui left floated">${expense.description}:</div>`))
                        .append($(`<div class="ui right floated">€ ${expense.price}</div>`)))
                }

                $('#expense_modal_confirm').attr('data-expense-id', request.attr('id'))
                $('#expense_modal_reject').attr('data-expense-id', request.attr('id'))

                total.html(`<strong>€ ${expenseRequest.total}</strong>`)
            },
            error: () => {
                receipts.last().remove()
                receipts.append($(`<div class="ui error message"><div class="header">There was an error connecting to the server. Please reload the page and try again!</div></div>`))
                total.html(`<strong>ERROR</strong>`)
            }
        })
    })

    $('#expense_modal_confirm').click(() => {
        $.ajax({
            url: '/api/expenses/resolve',
            method: 'POST',
            data: {
                expenseId: $('#expense_modal_confirm').attr('data-expense-id'),
                accepted: true
            },
            success: () => {
                $('#expense_modal').modal('hide')
                $($('#expense_modal_confirm').attr('data-expense-id')).remove()
            },
            error: () => {
                $('#expense_modal_receipts').last().remove()
                $('#expense_modal_receipts').append($(`<div class="ui error message"><div class="header">There was an error connecting to the server. Please reload the page and try again!</div></div>`))
            }
        })
    })

    $('#expense_modal_reject').click(() => {
        $('#expense_modal_reason').trigger('change')
        if ($('#expense_modal_reason').prop('valid')) {
            $.ajax({
                url: '/api/expenses/resolve',
                method: 'POST',
                data: {
                    expenseId: $('#expense_modal_reject').attr('data-expense-id'),
                    accepted: false,
                    reason: $('#expense_modal_reason').val()
                },
                success: () => {
                    $('#expense_modal').modal('hide')
                    $($('#expense_modal_reject').attr('data-expense-id')).remove()
                },
                error: () => {
                    $('#expense_modal_receipts').last().remove()
                    $('#expense_modal_receipts').append($(`<div class="ui error message"><div class="header">There was an error connecting to the server. Please reload the page and try again!</div></div>`))
                }
            })
        }
    })

    $('#expense_modal_reason').on('input change', () => {
        const reason = $('#expense_modal_reason')
        const field = reason.parent()
        if (!reason.val().match(/^[^<>]{1,200}$/u)) {
            field.attr('class', 'field error')
            reason.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            reason.prop('valid', true)
        }
    })

    $('#expense_modal_close').click(() => { $('#expense_modal').modal('hide') })
})