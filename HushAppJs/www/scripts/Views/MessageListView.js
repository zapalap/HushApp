var MessageListView = Backbone.View.extend({
    el: $('#message-list-area'),
    template: '#message-list',
    events: {
        'click button#refresh': 'refresh',
        'input input#range': 'refresh'
    },
    initialize: function (options) {
        _.bindAll(this, 'render', 'appendMessage', 'refresh', 'fetchMessages', 'addMessages');

        //resolve dependencies
        this.eventBus = options.eventBus;
        this.collectionService = options.collectionService;

        //bind global events
        this.eventBus.on('messageSent', this.refresh);
        this.eventBus.on('autoRefresh', this.refresh);

        this.collection = new MessageList();
        this.collection.bind('add', this.appendMessage);
        this.collection.bind('remove', this.removeMessage);
        this.render();
    },
    render: function () {
        var template = _.template($(this.template).html());
        $(this.el).append(template);
        this.refresh();
    },
    appendMessage: function (message) {
        var messageView = new MessageView({
            model: message
        });

        $(this.el).find("#messages-in-range").append(messageView.render().el);
    },
    removeMessage: function (message) {
        $('#' + message.get('id')).remove();
    },
    refresh: function () {
        navigator.geolocation.getCurrentPosition(this.fetchMessages);
    },
    fetchMessages: function (position) {
        var origin = {
            'longitude': position.coords.longitude,
            'latitude': position.coords.latitude
        };
        var range = $('#range').val();
        $.post('http://opasowo:6066/api/messages?distance=' + range, origin, this.addMessages);
    },
    addMessages: function (messages) {
        var col = _.pluck(this.collection.models, 'attributes');
        var reconciled = this.collectionService.recon(col, messages, 'id');
        this.collection.remove(reconciled.removed);
        this.collection.add(reconciled.added);
    }
});