define('views/joinView', ['text!views/templates/join.html'], function(template) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        id: 'confirmDialog',

        initialize: function(){
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #okBtn': 'onOK'
        },

        render: function() {
            this.$el.html(template);
            this.$('.join').i18n();
            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onCancel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('join-close', null);
        },

        onOk: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('join-ok', null);
        }
    });
});