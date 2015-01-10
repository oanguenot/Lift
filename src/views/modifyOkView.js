define('views/modifyOkView', ['text!views/templates/modifyok.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        error: '',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose'
        },

        setError: function(error) {
            this.error = error;
        },

        render: function() {
            this.$el.html(template);
            this.$('.modifyok').i18n();

            if(this.error === 'noright') {
                this.$('.titleModify').text(i18n.t('noright.title'));
                this.$('.detailsModify').text(i18n.t('noright.subtitle'));
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
            Backbone.Mediator.publish('modifyok-close', this.model);
        },


    });
});