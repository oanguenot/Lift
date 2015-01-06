define('views/meetingDetails', ['text!views/templates/meetingDetails.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        initialize: function(){
        },

        events: {
            //'click #closeBtn': 'onClose',
        },

        render: function() {

            var participantURL = this.model.get('protocol') + '//' + this.model.get('domain') + this.model.get('path') + this.model.get('callVanityParticipant');

            this.$el.html(template);
            this.$('.details').i18n();
            this.$('.details-subject').text(this.model.get('subject'));
            this.$('.details-url').html('<a href="' + participantURL + '" target="_blank">' + participantURL + '</a>');
            this.$('.details-participant').text(i18n.t('meetingDetails.participant') + ': ' + this.model.get('callVanityParticipant'));
            
            if(this.model.get('callVanityLeader').length > 0) {
                this.$('.details-leader').text(i18n.t('meetingDetails.leader') + ': ' + this.model.get('callVanityLeader'));
            }
            if(this.model.get('password')) {
                this.$('.details-password').text(i18n.t('meetingDetails.password') + ": " + this.model.get('password'));
            }

            var conferenceCall = this.model.get('call');

            if(conferenceCall && Object.keys(conferenceCall).length > 0) {

                var strCall = "";

                for (var name in conferenceCall) {
                    var number = conferenceCall[name];
                    strCall += '<li class="details-call"><span class="details-data">' + number + '</span><span="details-name">'+ name + '</span></li';
                }

                this.$('.details-audio-list').append(strCall);
            }
            else {
                this.$('details-audio-list').append(i18n.t('details.nocall'));
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