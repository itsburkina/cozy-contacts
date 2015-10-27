class Datapoint extends Backbone.Model
    defaults:
        name: 'other'
        type: 'other'
        value: ''


module.exports = class Contact extends Backbone.Model

    urlRoot: 'contacts'

    defaults:
        n: ';;;;'


    parse: (attrs) ->
        delete attrs[key] for key, value of attrs when value is ''

        if (url = attrs.url)
            delete attrs.url
            attrs.datapoints.unshift
                name:  'url'
                type:  'main'
                value: url

        # Ensure Datapoints consistency
        datapoints = @attributes.datapoints or
            new Backbone.Collection attrs.datapoints or [], model: Datapoint
        datapoints.comparator = 'name'
        attrs.datapoints = datapoints

        attrs.tags = _.invoke attrs.tags, 'toLowerCase'

        return attrs


    sync: (method, model, options) ->
        avatar = model.get('avatar') or model.get('photo')
        if avatar
            model.unset 'avatar', silent: true
            model.unset 'photo', silent: true

            success = options.success
            # Call savePicture after sync.
            options.success = (data, textStatus, jqXHR) =>
                @savePicture avatar, data,
                    success: =>
                        success.apply @, arguments
                        # SavePicture (neither sync) doesn't update model,
                        # we have to fetch it to get the accurate picture infos
                        @fetch()

                    error: options.error

        # Handle specific attributes.
        options.attrs = model.toJSON()

        datapoints = model.attributes.datapoints?.toJSON() or []
        mainUrl = _.findWhere datapoints, name: 'url'

        if mainUrl
            options.attrs.datapoints = _.without datapoints, mainUrl
            options.attrs.url = mainUrl.value

        super


    toString: (opts = {}) ->
        [gn, fn, ...] = parts = @attributes.n.split ';'
        # wrap given name (at index 0) in pre/post tags if provided
        gn = _.compact([opts.pre, gn, opts.post]).join ''
        parts[0] = fn
        parts[1] = gn
        _.compact(parts).join ' '


    match: (pattern, opts = {}) ->
        format = if opts.format
            pre: '»'
            post: '«'
        else undefined

        search = fuzzy.match pattern, @toString(format), opts

        if search and format
            search.rendered = search.rendered
                .replace '»', opts.format.pre
                .replace '«', opts.format.post

        return search


    toJSON: ->
        _.extend {}, super, datapoints: @attributes.datapoints?.toJSON() or []


    savePicture: (imgData, attrs, options) ->
        unless attrs.id
            return options.error new Error 'Model should have been saved once.'

        #transform into a blob
        binary = atob imgData
        array = []
        for i in [0..binary.length]
            array.push binary.charCodeAt i

        blob = new Blob [new Uint8Array(array)], type: 'image/jpeg'

        data = new FormData()
        data.append 'picture', blob
        data.append 'contact', attrs

        $.ajax
            type: 'PUT'
            url: "contacts/#{attrs.id}/picture"
            data: data
            contentType: false
            processData: false
            success: options.success
            error: options.error


    picturetoa: (cb) ->
        return cb() unless @attributes._attachments?.picture
        picture = new Image()
        picture.onload = ->
            canvas = document.createElement 'canvas'
            canvas.width = @naturalWidth
            canvas.height = @naturalHeight
            ctx = canvas.getContext '2d'
            ctx.drawImage @, 0, 0
            [..., base64string] = canvas.toDataURL("image/jpeg").split ','
            cb base64string
        picture.src = "contacts/#{@id}/picture.png"


    toVCF: (cb) ->
        data = @toJSON()
        @picturetoa (picture) -> _.delay cb, 0, VCardParser.toVCF data, picture
