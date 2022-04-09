$(document).ready(() => {

    // Award Cert
    $('#award_cert').click(() => {
        $('#award_cert_modal').modal('show')
        const form = $('#award_cert_modal_form')
        form.prop('loaded', false)
        form.attr('class', 'ui loading form')

        $.ajax({
            url: '/api/certs',
            method: 'GET',
            success: (certs) => {
                if (form.prop('loaded') == true) form.removeClass('loading')
                else form.prop('loaded', true)
                var values = []
                for (var cert of certs) values.push({
                    name: cert.name,
                    value: cert.id
                })
                $('#award_cert_modal_cert_dropdown').dropdown({
                    placeholder: 'Certificate',
                    match: 'text',
                    fullTextSearch: 'exact',
                    ignoreDiacritics: 'true',
                    values: values
                })
            },
            error: () => { form.attr('class', 'ui error form') }
        })

        $.ajax({
            url: '/api/members',
            method: 'GET',
            success: (members) => {
                if (form.prop('loaded') == true) form.removeClass('loading')
                else form.prop('loaded', true)
                var values = []
                for (var member of members) values.push({
                    name: `${member.firstName} ${member.lastName}`,
                    value: member.memberId,
                    image: member.img
                })
                $('#award_cert_modal_member_dropdown').dropdown({
                    placeholder: 'Members',
                    match: 'text',
                    fullTextSearch: 'exact',
                    ignoreDiacritics: 'true',
                    className: {
                        image: 'ui avatar image'
                    },
                    values: values
                })
            },
            error: () => { form.attr('class', 'ui error form') }
        })
    })

    $('#award_cert_modal_confirm').click(() => {
        $.ajax({
            url: '/api/safety/award',
            method: 'POST',
            data: {
                certId: $('#award_cert_modal_cert_dropdown_input').val(),
                memberIds: $('#award_cert_modal_member_dropdown_input').val()
            },
            error: () => { $('#award_cert_modal_form').attr('class', 'ui error form') }
        })
    })



    // Revoke Cert
    $('#revoke_cert').click(() => {
        $('#revoke_cert_modal_cards').html('')
        $('#revoke_cert_modal').modal('show')
        const form = $('#revoke_cert_modal_form')
        form.prop('loaded', false)
        form.attr('class', 'ui loading form')

        $.ajax({
            url: '/api/members',
            method: 'GET',
            success: (members) => {
                var values = []
                for (var member of members) values.push({
                    name: `${member.firstName} ${member.lastName}`,
                    value: member.memberId,
                    image: member.img
                })
                form.removeClass('loading')
                $('#revoke_cert_modal_member_dropdown').dropdown({
                    placeholder: 'Members',
                    match: 'text',
                    fullTextSearch: 'exact',
                    ignoreDiacritics: 'true',
                    className: {
                        image: 'ui avatar image'
                    },
                    values: values
                })
            },
            error: () => { form.attr('class', 'ui error form') }
        })
    })

    $('#revoke_cert_modal_member_dropdown_input').on('change', () => {
        const cards = $('#revoke_cert_modal_cards')

        $.ajax({
            url: '/api/member',
            method: 'POST',
            data: { memberId: $('#revoke_cert_modal_member_dropdown_input').val() },
            success: (member) => {
                for (var cert of member.certs) {
                    cards.append(
                        $('<div class="ui fluid card"></div>').append(
                            $('<div class="content"></div>').append(
                                $('<div class="header"></div>').append(
                                    $('<div class="ui left floated"></div>').text(cert.name),
                                    $('<button class="ui right floated negative button revoke" data-cert="'+cert.id+'">Revoke</button>').click(() => {
                                        var id = cert.id
                                        $.ajax({
                                            url: '/api/safety/revoke',
                                            method: 'POST',
                                            data: {
                                                certId: id,
                                                memberId: member.memberId
                                            },
                                            success: () => {
                                                $('#revoke_cert_modal_error').hide()
                                            },
                                            error: () => {
                                                $('#revoke_cert_modal_error').show()
                                            }
                                        })
                                    })
                                ),
                                $('<h5></h5>').text(cert.category + ' Certificate')
                            )
                        )
                    )
                }
                $('#revoke_cert_modal_error').hide()
            },
            error: () => { $('#revoke_cert_modal_error').show() }
        })
    })
})