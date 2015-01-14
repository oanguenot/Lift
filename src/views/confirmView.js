define('views/confirmView', ['text!views/templates/confirm.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            'click #cancelConfirm': 'onCancel',
            'click #okConfirm': 'onOk'
        },

        render: function() {
            this.$el.html(template);
            this.$('.confirm').i18n();
            this.$('.detailsConfirm').text(i18n.t('confirm.subtitle') + ": " + this.model.get('subject'));
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
            Backbone.Mediator.publish('confirm-close', false);
        },

        onOk: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('confirm-close', true);
        },


    });
});