define('views/mainView', ['text!views/templates/main.html'], function(template) {

    return Backbone.View.extend({

        itemName: 'div',

        className: 'displayed',

        id: 'list',

        initialize: function(){
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
        }

    });


});