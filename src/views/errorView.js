define('views/errorView', ['text!views/templates/error.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        id: 'errorLogin',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose'
        },

        render: function() {
            this.$el.html(template);
            this.$('.popup').i18n();

            var user = models.user();
            if(user.hasErrorOfTypeLogin()) {
                this.$('.error-next').text(i18n.t('error.subtitle-err-login'));
            }
            else {
                this.$('.error-next').text(i18n.t('error.subtitle-err-certificate'));
                this.$('.error-next-next').text(i18n.t('error.subtitle-err-certificate-next'));
            }

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