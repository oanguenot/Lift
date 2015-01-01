define('views/detailsView', ['text!views/templates/details.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            'click #closeBtn': 'onClose',
        },

        render: function() {
            var settings = models.settings();

            var participantURL = settings.get('protocol') + '//' + settings.get('domain') + this.model.get('path') + this.model.get('callVanityParticipant');

            this.$el.html(template);
            this.$('.details').i18n();
            this.$('.details-subject').text(i18n.t('details.subject') + ': ' + this.model.get('subject'));
            this.$('.participantURL').html(i18n.t('details.url') + ': ' + '<a href="' + participantURL + '" target="_blank">' + participantURL + '</a>');
            this.$('.participant').text(i18n.t('details.code') + ': ' + this.model.get('callVanityParticipant'));
            
            if(this.model.get('callVanityLeader').length > 0) {
                this.$('.leader').text(i18n.t('details.leader') + ': ' + this.model.get('callVanityLeader'));
            }
            if(this.model.get('password')) {
                this.$('.password').text(i18n.t('details.password') + ": " + this.model.get('password'));
            }

            var conferenceCall = settings.getConferenceCallInformation();

            if(conferenceCall) {

                var strCall = "";



                for (var name in conferenceCall) {
                    var number = conferenceCall[name];
                    strCall += '<p>' + name + '</p><p>' + number + '</p>';
                }

                this.$('.call').html(strCall);
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