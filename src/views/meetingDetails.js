define('views/meetingDetails', ['text!views/templates/meetingDetails.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        participantURL: '',

        initialize: function(){
        },

        events: {
            'click #emailBtn': 'onEmail'
        },

        render: function() {

            this.participantURL = this.model.get('protocol') + '//' + this.model.get('domain') + this.model.get('path') + this.model.get('callVanityParticipant');

            this.$el.html(template);
            this.$('.details').i18n();
            this.$('.details-subject').text(this.model.get('subject'));
            this.$('.details-url').html('<a href="' + this.participantURL + '" target="_blank">' + this.participantURL + '</a>');
            this.$('.details-code-list').append('<li class="details-call"><span class="details-data details-short-length">' + this.model.get('callVanityParticipant') + '</span><span class="details-label">' + i18n.t('meetingDetails.participant') + '</span></li>');
            
            if(this.model.get('callVanityLeader').length > 0) {
                this.$('.details-code-list').append('<li class="details-call"><span class="details-data details-short-length">' + this.model.get('callVanityLeader') + '</span><span class="details-label">' + i18n.t('meetingDetails.leader') + '</span></li>');
            }
            if(this.model.get('password') && this.model.get('password').length > 0) {
             this.$('.details-code-list').append('<li class="details-call"><span class="details-data details-short-length">' + this.model.get('password') + '</span><span class="details-label">' + i18n.t('meetingDetails.password') + '</span></li>');
            }

            var conferenceCall = this.model.get('call');

            if(conferenceCall && Object.keys(conferenceCall).length > 0) {

                var strCall = "";

                for (var name in conferenceCall) {
                    var number = conferenceCall[name];
                    strCall += '<li class="details-call"><span class="details-data details-margin details-length">' + number + '</span><span class="details-label">'+ name + '</span></li>';
                }

                this.$('.details-audio-list').append(strCall);
            }
            else {
                this.$('.details-audio-list').append('<li class="details-call"><span class="details-label">' + i18n.t('meetingDetails.nocall') + '</span></li>');
            }


            var rosters = this.model.get('roster');
            if (rosters && rosters.length > 0) {
                var listOfRoster = rosters.split(';'),
                nbRosters = listOfRoster.length;

                var max = nbRosters > 8 ? 8 : nbRosters;

                for (var i = 0, len=max; i < len; i++) {

                    var roster = listOfRoster[i],
                        rosterInfos = roster.split(':'),
                        email = rosterInfos[0],
                        role = rosterInfos.length > 1 ? i18n.t('meetingDetails.' + rosterInfos[1]) : i18n.t('meetingDetails.participant');

                    this.$('.details-invite-list').append('<li class="details-call"><span class="details-data details-margin details-wide-length">' + email + '</span><span class="details-label">' +role + '</span></li>');
                }

                if(max < nbRosters) {

                    if(nbRosters-max === 1) {
                        this.$('.details-invite-list').append('<li class="details-call"><span class="details-label">' + '1 ' + i18n.t('meetingDetails.more') + '</span></li>');
                    } else {
                        this.$('.details-invite-list').append('<li class="details-call"><span class="details-label">' +  (nbRosters - max)  + ' ' + i18n.t('meetingDetails.mores') + '</span></li>');
                    }
                }
            }
            else {
                this.$('.details-invite-list').append('<li class="details-call"><span class="details-label">' + i18n.t('meetingDetails.noinvite') + '</span></li>');
            }

            if(this.model.get('isAnInvite')) {
                this.$('.details-from').removeClass('masked');
                this.$('.details-from').text(this.model.get('inviteFrom'));
                this.$('.details-from-option').removeClass('masked');
            }

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onEmail: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var email = '';
            var subject = 'Meeting Invite';
            var emailBody = 'Hi Nirbhay';
            window.open('mailto:' + email + '?subject=' + subject + '&body=' + emailBody);
        }
    });
});