define('views/modifyOkView', ['text!views/templates/modifyok.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose'
        },

        render: function() {
            this.$el.html(template);
            this.$('.modifyok').i18n();
            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onClose: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('modifyok-close', this.model);
        },


    });
});