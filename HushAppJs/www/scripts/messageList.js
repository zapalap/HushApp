/// <reference path="script/backbone.js"/>
/// <reference path="script/underscore.js"/>


var Message = Backbone.Model.extend({
    defaults: {
        id: 0,
        text: "Default",
        latitude: 0,
        longitude: 0,
        dateCreated: ""
    }
});

var MessageList = Backbone.Collection.extend({
    model: Message
});

var MessageView = Backbone.View.extend({
    template: "#message-template",
    initialize: function () {
        _.bindAll(this, 'render');
    },
    render: function () {
        var template = _.template($(this.template).html(), { messageText: this.model.get('text'), messageId: this.model.get('id') });
        $(this.el).html(template);
        return this;
    }
});

var MessageListView = Backbone.View.extend({
    el: $('#message-list-area'),
    template: '#message-list',
    events: {
        'click button#refresh': 'refresh',
        'input input#range': 'refresh'
    },
    initialize: function (options) {
        _.bindAll(this, 'render', 'appendMessage', 'refresh', 'fetchMessages', 'addMessages');
        options.vent.bind("messageSent", 'refresh');

        this.collection = new MessageList();
        this.collection.bind('add', this.appendMessage);
        this.collection.bind('remove', this.removeMessage);
        this.render();
    },
    render: function () {
        var self = this;
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

        var localIds = _.pluck(col, 'id');
        var remoteIds = _.pluck(messages, 'id');

        var removed = _.difference(localIds, remoteIds);
        var added = _.without.apply(_, [remoteIds].concat(localIds).concat(removed));

        var removedCol = _.filter(col, (message) => _.contains(removed, message.id));
        var addedCol = _.filter(messages, (message) => _.contains(added, message.id));

        this.collection.remove(removedCol);
        this.collection.add(addedCol);
    }
});

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

var vent = _.extend({}, Backbone.Events);

