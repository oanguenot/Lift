define('views/detailsView', ['text!views/templates/details.html'], function(template) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose',
        },

        render: function() {
            this.$el.html(template);
            this.$('.details').i18n();
            this.$('.participantURL').html('<a href="' + this.model.get('participantURL') + '" target="_blank">' + this.model.get('participantURL') + '</a>');
            this.$('.participant').text(i18n.t('details.code') + ': ' + this.model.get('callVanityParticipant'));
            this.$('.leader').text(i18n.t('details.leader') + ': ' + this.model.get('callVanityLeader').length > 0 ? this.model.get('callVanityLeader') : i18n.t('details.noinfo'));
            if(this.model.get('password')) {
                this.$('.password').text(i18n.t('details.password') + ": " + this.model.get('password'));
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
            Backbone.Mediator.publish('details-close', null);
        }
    });
});