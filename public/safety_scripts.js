$(document).ready(() => {

    $('#award_skill').click(() => {
        $('#award_skill_modal').modal('show')
        const form = $('#award_skill_modal_form')
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
                $('#award_skill_modal_cert_dropdown').dropdown({
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
                $('#award_skill_modal_member_dropdown').dropdown({
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

    $('#award_skill_modal_confirm').click(() => {
        $.ajax({
            url: '/api/safety/award',
            method: 'POST',
            data: {
                cert: $('#award_skill_modal_cert_dropdown_input').val(),
                members: $('#award_skill_modal_member_dropdown_input').val()
            },
            error: () => { $('#award_skill_modal_form').attr('class', 'ui error form') }

        })
    })
})