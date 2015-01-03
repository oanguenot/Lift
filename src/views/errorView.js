define('views/errorView', ['text!views/templates/error.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        id: 'errorLogin',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose',
            'click #testBtn': 'onTest'
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
        },

        onTest: function(e) {
        	e.preventDefault();
            e.stopPropagation();

            var user = models.user();

            var url = "https://" + user.getHost();

            console.log("URL", url);

            window.open(url, "_blank");
        }
    });
});