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