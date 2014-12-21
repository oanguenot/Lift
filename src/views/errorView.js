define('views/errorView', ['text!views/templates/error.html'], function(template) {

    return Backbone.View.extend({

        itemName: 'div',

        className: 'modalDialog visible',

        id: 'errorLogin',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose',
        },

        render: function() {
            this.$el.html(template);
            this.$('.popup').i18n();
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
            Backbone.Mediator.publish('error-close', null);
        }
    });
});