define('views/passwordView', ['text!views/templates/password.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        info: 'web',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose'
        },

        setInfo: function(infoOfType) {
            this.info = infoOfType;
        },

        render: function() {
            this.$el.html(template);
            this.$('.password').i18n();

            var settings = models.settings();

            if(this.info === "web") {
                var web = settings.getWebPasswordRules();
                if(web.min_length) {
                    this.$('.password-length').text(i18n.t('password.min') + ': ' + web.min_length);
                }
                else {
                    this.$('.password-length').text(i18n.t('password.nomin'));
                }
                if(web.hasDigit && (web.hasLowercase || web.hasUppercase) && web.hasSpecial) {
                    this.$('.password-characters').text(i18n.t('password.special'));
                }
                else if(web.hasDigit && (web.hasLowercase || web.hasUppercase)) {
                    this.$('.password-characters').text(i18n.t('password.alpha'));
                }
                else if(web.hasLowercase || web.hasUppercase) {
                    this.$('.password-characters').text(i18n.t('password.letter'));
                }
                else {
                    this.$('.password-characters').text(i18n.t('password.digit'));
                }

                if(web.hasLowercase && web.hasUppercase) {
                    this.$('.password-lowercase').text(i18n.t('password.full'));
                }
                else if(web.hasLowercase) {
                    this.$('.password-lowercase').text(i18n.t('password.lowercase'));
                }
                else {
                    this.$('.password-lowercase').text(i18n.t('password.uppercase'));
                }
            }
            else {
                var audio = settings.getAudioPasswordRules();
                if(audio.min_length) {
                    this.$('.password-length').text(i18n.t('password.min') + ': ' + audio.min_length);
                }
                else {
                    this.$('.password-length').text(i18n.t('password.nomin'));
                }
                this.$('.password-characters').text(i18n.t('password.digit'));
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
            Backbone.Mediator.publish('password-close', this.model);
        },


    });
});