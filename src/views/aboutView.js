
define('views/aboutView', ['text!views/templates/about.html', 'models/models'], function(template, models) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            'click #closeBtn' : 'onClose',
            'click .termsLink': 'onTerms'
        },

        render: function() {

            this.$el.html(template);
            this.$('.popupSettings').i18n();

            var manifest = chrome.runtime.getManifest();

            this.$('.aboutInfo').html(i18n.t('about.version') + ' ' + manifest.version);
            if(models.user().isConnected()) {
            	this.$('.acsInfo').html(i18n.t('about.version') + ' ' + this.model.getACSVersion() + ' (ACS)');
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
            Backbone.Mediator.publish('about-close', null);
        },

        onTerms: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('about-terms', null);
        }
    });
});