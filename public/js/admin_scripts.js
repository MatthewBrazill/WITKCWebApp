$(document).ready(() => {
    $.ajax({
        url: '/api/members/list',
        method: 'GET',
        success: (members) => {
            $.ajax({
                url: '/api/committee',
                method: 'GET',
                success: (committee) => {
                    for (role in committee) {
                        var values = []
                        for (var member of members) {
                            values.push({
                                name: `${member.firstName} ${member.lastName}`,
                                value: member.memberId,
                                image: member.img,
                                selected: (committee[role].member.memberId == member.memberId)
                            })
                        }

                        $(`#assign_${committee[role].roleId}_dropdown`).dropdown({
                            placeholder: 'Not Currently Filled...',
                            match: 'text',
                            fullTextSearch: 'exact',
                            ignoreDiacritics: 'true',
                            forceSelection: false,
                            className: {
                                image: 'ui avatar image'
                            },
                            values: values
                        })
                    }
                }
            })
        }
    })

    $('#assign_committee_button').click(() => {
        $.ajax({
            url: '/api/committee/appoint',
            method: 'POST',
            data: {
                captain: $('#assign_captain').val(),
                vice: $('#assign_vice').val(),
                safety: $('#assign_safety').val(),
                treasurer: $('#assign_treasurer').val(),
                equipments: $('#assign_equipments').val(),
                pro: $('#assign_pro').val(),
                freshers: $('#assign_freshers').val()
            },
            success: () => {
                $("#appointment_success").show()
                $('#appointment_error').hide()
            },
            error: () => {
                $("#appointment_success").hide()
                $('#appointment_error').show()
            }
        })
    })
})