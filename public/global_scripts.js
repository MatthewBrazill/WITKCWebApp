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
        url: '/api/cookie/check',
        method: 'GET',
        success: (res) => {
            if (!res.allowCookies) $('#cookie_nag').nag({ persists: true })
            else {
                window.DD_RUM && window.DD_RUM.init({
                    applicationId: 'd8892f0f-d31f-4804-b21e-c630a433a383',
                    clientToken: 'pub86493d96655e179161fb37ff340b7255',
                    site: 'datadoghq.com',
                    service: 'setukc-webapp',
                    env: '{{env}}',
                    sampleRate: 100,
                    premiumSampleRate: 100,
                    trackFrustrations: true,
                    defaultPrivacyLevel: 'mask-user-input'
                });
                window.DD_RUM && window.DD_RUM.startSessionReplayRecording()
            }
        }
    })

    $('#nag_decline').click(() => $('#cookie_nag').hide())
    $('#nag_accept').click(() => {
        $('#cookie_nag').hide()
        $.ajax({
            url: '/api/cookie/allow',
            method: 'GET'
        })
    })



    $('.announcement_icon').click(function () {
        const announcement = $(this).parent()
        $.ajax({
            url: '/api/announcement/read',
            method: 'POST',
            data: { announcementId: announcement.attr('id') },
            success: () => announcement.remove(),
        })
    })
})