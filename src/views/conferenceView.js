define('views/conferenceView', ['text!views/templates/conference.html'], function(template) {

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
            //this.$('.mainScreen').i18n();

            this.$el.addClass('v-' + this.model.get('vanity'));

            this.$('.meeting-state').addClass('meeting-' + this.model.get('state'));
            this.$('.meetingTitle').text(this.model.get('subject'));
            if(this.model.get('isAnInvite')) {
                this.$('.meetingState').html('<small>Invite from </small>' + this.model.get('owner'));
            }
            else {
                this.$('.meetingState').text(this.model.get('stateDisplayed'));
            }

            if(this.model.get('typeConf') === "scheduled") {
                this.$('.meetingTime').text(this.model.get('startTime') + " - " + this.model.get('endTime'));
                this.$('.meetingTimezone').text(this.model.get('timezone'));
            }
            else {
                this.$('.meetingTime').text('Whole day');
                if (this.model.get('days') > 30) {
                    this.$('.meetingTimezone').text('> 1 month left');
                }
                else if (this.model.get('days') > 1) {
                    this.$('.meetingTimezone').text(this.model.get('days') + " days left");
                }
                else if (this.model.get('days') === 1) {
                    this.$('.meetingTimezone').text(this.model.get('days') + " day left");
                }
                else if (this.model.get('days') === 0) {
                    this.$('.meetingTimezone').text("Expires today");
                }
                else {
                    this.$('.meetingTimezone').text("");
                }
            }

            this.$('.meeting-join-button').attr("id","join-" + this.model.get('vanity'));
            this.$('.meeting-details-button').attr("id", "details-" + this.model.get('vanity'));
            this.$('.meeting-edit-button').attr("id", "edit-" + this.model.get('vanity'));
            this.$('.meeting-remove-button').attr("id", "remove-" + this.model.get('vanity'));

            if(this.model.get('isAnInvite')) {
                this.$('.meeting-edit-button').addClass('.meeting-edit-button-disabled');
                this.$('.meeting-remove-button').addClass('.meeting-remove-button-disabled');
            }


            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onRemove: function() {

        },

        onEdit: function() {

        },

        onDetails: function() {

        },

        onJoin: function() {
            
        }
    });
});
