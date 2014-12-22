define('views/mainView', ['text!views/templates/main.html', 'views/conferenceView'], function(template, ConferenceView) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        id: 'list',

        initialize: function(){
            this.listenTo(this.collection, 'add', this.onAddConference);
        },

        events: {
            'click .aboutButton' : 'onAbout',
            'click #createBtn': 'onCreate',
            'click #settingBtn': 'onSettings',
        },

        render: function() {
            this.$el.html(template);
            this.$('.mainScreen').i18n();
            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onAbout: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('main-about', null);
        },

        onCreate: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('main-meeting', null);
        },

        onSettings: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('main-settings', null);
        },

        blur: function() {
            $(this.el).addClass('blur');
        },

        unblur: function() {
            $(this.el).removeClass('blur'); 
        },

        hideEmptyArea: function() {
            this.$('#empty').addClass('masked');
        },

        showEmptyArea: function() {
            this.$('#empty').removeClass('masked');
        },

        onAddConference: function(model) {
            this.hideEmptyArea();

            var view = new ConferenceView({model: model});
            this.$('.meetings').append(view.render().el);
        }

    });


});