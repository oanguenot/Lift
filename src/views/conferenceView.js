define('views/conferenceView', ['text!views/templates/conference.html'], function(template) {

    return Backbone.View.extend({

        tagName: 'li',

        className: 'conference-item',

        initialize: function(){
        },

        events: {
        },

        render: function() {
            this.$el.html(template);
            //this.$('.mainScreen').i18n();

            this.$el.addClass('v-' + this.model.get('vanity'));

            this.$('.meeting-state').addClass('meeting-' + this.model.get('state'));
            this.$('.meetingTitle').text(this.model.get('subject'));

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        }
    });
});
