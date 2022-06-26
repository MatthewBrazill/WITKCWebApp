$(document).ready(() => {
    $('#language_dropdown').dropdown({
        values: [{
            name: 'English',
            value: 'en-IE',
            icon: 'uk',
            iconClass: 'flag',
            selected: true
        }, {
            name: 'Irish',
            value: 'ga-IE',
            icon: 'ie',
            iconClass: 'flag',
            disabled: true
        }, {
            name: 'German',
            value: 'de-DE',
            icon: 'de',
            iconClass: 'flag',
            disabled: true
        }, {
            name: 'Spanish',
            value: 'es-ES',
            icon: 'es',
            iconClass: 'flag',
            disabled: true
        }, {
            name: 'French',
            value: 'fr-FR',
            icon: 'fr',
            iconClass: 'flag',
            disabled: true
        }]
    })



    $.ajax({
        url: '/api/cookie_choice',
        method: 'GET',
        success: (res) => {
            if (!res.allow_cookies) $('#cookie_nag').nag({ persists: true })
        }
    })

    $('#nag_decline').click(() => $('#cookie_nag').hide())
    $('#nag_accept').click(() => {
        $('#cookie_nag').hide()
        $.ajax({
            url: '/api/cookie_choice',
            method: 'POST',
            data: { allow_cookies: true }
        })
    })



    $('.announcement_icon').click(function () {
        const announcement = $(this).parent()
        $.ajax({
            url: '/api/committee/announcement/mark_as_read',
            method: 'POST',
            data: { announcementId: announcement.attr('id') },
            success: () => announcement.remove(),
        })
    })
})