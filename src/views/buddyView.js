define('views/buddyView', ['text!views/templates/buddy.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'li',

        className: 'buddy-item',

        initialize: function(){
        },

        events: {
            'click .buddy-inviteBtn': 'onInvite',
        },

        render: function() {
            this.$el.html(template);
            this.$('.buddy-name').text(this.model.getDisplayName());

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onInvite: function(e) {
            e.preventDefault();
            e.stopPropagation();
            //Backbone.Mediator.publish('conference-invite', this.model);
        }
    });
});
