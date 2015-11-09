var InputView = Backbone.View.extend({
    el: $('#input-area'),
    template: '#input-template',
    events: {
        'click button#send-button': 'sendIfAcquired'
    },
    initialize: function (options) {
        _.bindAll(this, 'sendMessage', 'sendIfAcquired')
        this.vent = options.vent;
        this.render();
    },
    render: function () {
        var template = _.template($(this.template).html());
        $(this.el).html(template);
    },
    sendIfAcquired: function () {
        navigator.geolocation.getCurrentPosition(this.sendMessage);
    },
    sendMessage: function (position) {
        var message = {
            'text': $("#message-text").val(),
            'longitude': position.coords.longitude,
            'latitude': position.coords.latitude
        };

        var settings = {
            url: 'http://opasowo:6066/api/messages',
            data: message,
            type: 'POST',
            dataType: 'json',
            success: (response) => {
                this.vent.trigger("messageSent");
            }
        }

        $.ajax(settings);
    }
});