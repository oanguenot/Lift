define('views/conferenceView', ['text!views/templates/conference.html', 'models/models'], function(template, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'li',

        className: 'conference-item',

        initialize: function(){
        },

        events: {
            'click .meeting-join-button': 'onJoin',
            'click .meeting-details-button': 'onDetails',
            'click .meeting-edit-button': 'onEdit',
            'click .meeting-remove-button': 'onRemove'
        },

        render: function() {
            this.$el.html(template);
            this.$('.conference-elt').i18n();

            console.log("MODEL", this.model);

            this.$el.addClass('v-' + this.model.get('vanity'));

            this.$('.meeting-state').addClass('meeting-' + this.model.get('state'));
            this.$('.meetingTitle').text(this.model.get('subject'));
            if(this.model.get('isAnInvite')) {
                var buddies = models.buddies();
                var buddy = buddies.getABuddy(this.model.get('from'));

                this.$('.meetingState').html(i18n.t('conference.invite') + " " + buddy.getDisplayName() + ' - ' + this.model.get('stateDisplayed'));
            }
            else {
                this.$('.meetingState').text(this.model.get('stateDisplayed'));
            }

            if(this.model.get('typeConf') === "scheduled") {
                this.$('.meetingTime').text(this.model.get('startTimeString') + " - " + this.model.get('endTimeString'));
                this.$('.meetingTimezone').text(this.model.get('timezone'));
            }
            else {
                this.$('.meetingTime').text(i18n.t('conference.wholeday'));
                if (this.model.get('days') > 30) {
                    this.$('.meetingTimezone').text(i18n.t('conference.onemonth'));
                }
                else if (this.model.get('days') > 1) {
                    this.$('.meetingTimezone').text(this.model.get('days') + " " + i18n.t('conference.daysleft'));
                }
                else if (this.model.get('days') === 1) {
                    this.$('.meetingTimezone').text(this.model.get('days') + " " + i18n.t('conference.dayleft'));
                }
                else if (this.model.get('days') === 0) {
                    this.$('.meetingTimezone').text(i18n.t("conference.expire"));
                }
                else {
                    this.$('.meetingTimezone').text("");
                }
            }

            this.$('.meetingStartDate').text(this.model.get('startDateString'));
            this.$('.meetingStartDateNext').text(this.model.get('startDateStringNext'));

            if(this.model.get('isAnInvite')) {
                this.$('.meeting-edit-button').addClass('meeting-edit-button-disabled');
                this.$('.meeting-remove-button').addClass('meeting-remove-button-disabled');
                //this.$('.meeting-invite-button').addClass('meeting-invite-button-disabled');
            }

            this.$('.meeting-join-button').attr('title', i18n.t('conference.join'));
            this.$('.meeting-edit-button').attr('title', i18n.t('conference.edit'));
            this.$('.meeting-remove-button').attr('title', i18n.t('conference.remove'));
            this.$('.meeting-details-button').attr('title', i18n.t('conference.details'));

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onRemove: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('conference-remove', this.model);
        },

        onEdit: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('conference-edit', this.model);
        },

        onDetails: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('conference-details', this.model);
        },

        onJoin: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('conference-join', this.model);
        }
    });
});
