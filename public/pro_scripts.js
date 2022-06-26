$(document).ready(() => {
    new Quill('#editor_article_modal_editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [4, 5, 6, false] }],

                ['bold', 'italic', 'underline', 'strike'],
                ['link', 'blockquote', 'code-block'],

                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }, { 'list': 'ordered' }, { 'list': 'bullet' }],

                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],

                ['clean']
            ]
        }
    })

    $('#article_modal').modal({
        onApprove: () => false,
        onDeny: () => false
    })

    $('#select_article_modal').modal({
        onApprove: () => false,
        onDeny: () => false,
        onShow: () => {
            $.ajax({
                url: '/api/pro/article/list',
                method: 'GET',
                success: (articles) => {
                    const cards = $('#select_article_modal_cards')
                    cards.html('')

                    for (article of articles) {
                        cards.append($(`<div class="ui fluid link card" id="${article.articleId}"></div>`).click(function () {
                            $.ajax({
                                url: '/api/pro/article/get',
                                method: 'POST',
                                data: { articleId: $(this).attr('id') },
                                success: (article) => {
                                    $('#article_modal_title').html(article.title)
                                    $('#article_modal_content').html(article.article)
                                    $('#article_modal').attr('data-articleId', article.articleId)
                                    $('#article_modal').modal('show')
                                    $('#select_article_modal').modal('hide')
                                }
                            })
                        }).append($(`<div class="content"><div class="header">${article.title}</div></div>`)))
                    }
                },
                error: () => {
                    const cards = $('#select_article_modal_cards')
                    cards.html('<div class="ui fluid placeholder segment"><div class="ui icon header"><i class="exclamation icon"></i>The website currently has no articles!</div></div>')
                }
            })
        }
    })

    $('#editor_article_modal').modal({
        onApprove: () => false,
        onDeny: () => false
    })



    $('#articles').click(() => {
        $('#select_article_modal').modal('show')
    })

    $('#select_article_modal_close').click(() => { $('#select_article_modal').modal('hide') })
    $('#select_article_modal_new').click(() => {
        $('#editor_article_modal_save').show()
        $('#editor_article_modal_update').hide()
        $('#input_error').hide()
        $('#network_error').hide()
        $('#editor_article_modal').modal('show')
        $('#select_article_modal').modal('hide')
    })

    $('.article_modal_back').click(function () {
        $('#select_article_modal').modal('show')
        $(this).parent().parent().modal('hide')
    })

    $('#editor_article_modal_save').click(() => {
        const article = $('#editor_article_modal_editor').children().first().html()
        const title = $('#editor_article_modal_title').val()
        var valid = true

        if (!title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
        if (article.match(/<\s*script.*>/)) valid = false

        if (valid) {
            $.ajax({
                url: '/api/pro/article/create',
                method: 'POST',
                data: {
                    title: title,
                    article: article
                },
                success: () => {
                    $('#select_article_modal').modal('show')
                    $('#editor_article_modal').modal('hide')
                },
                error: () => { $('#network_error').show() }
            })
        } else { $('#input_error').show() }
    })

    $('#editor_article_modal_update').click(() => {
        const articleId = $('#editor_article_modal').attr('data-articleId')
        const article = $('#editor_article_modal_editor').children().first().html()
        const title = $('#editor_article_modal_title').val()
        var valid = true

        if (!title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
        if (article.match(/<\s*script.*>/)) valid = false

        if (valid) {
            $.ajax({
                url: '/api/pro/article/update',
                method: 'POST',
                data: {
                    articleId: articleId,
                    title: title,
                    article: article
                },
                success: () => {
                    $('#select_article_modal').modal('show')
                    $('#editor_article_modal').modal('hide')
                },
                error: () => { $('#network_error').show() }
            })
        } else { $('#input_error').show() }
    })

    $('#article_modal_edit').click(() => {
        $.ajax({
            url: '/api/pro/article/get',
            method: 'POST',
            data: { articleId: $('#article_modal').attr('data-articleId') },
            success: (article) => {
                $('#editor_article_modal').attr('data-articleId', article.articleId)
                $('#editor_article_modal_title').val(article.title)
                $('#editor_article_modal_editor').children().first().html(article.article)
                $('#editor_article_modal_save').hide()
                $('#editor_article_modal_update').show()
                $('#input_error').hide()
                $('#network_error').hide()
                $('#editor_article_modal').modal('show')
                $('#article_modal').modal('hide')
            }
        })
    })

    $('#article_modal_delete').click(() => {
        $.ajax({
            url: '/api/pro/article/delete',
            method: 'POST',
            data: { articleId: $('#article_modal').attr('data-articleId') },
            success: (article) => {
                $('#editor_article_modal').attr('data-articleId', article.articleId)
                $('#select_article_modal').modal('show')
                $('#article_modal').modal('hide')
            }
        })
    })
})