define('views/mainView', ['text!views/templates/main.html', 'views/conferenceView'], function(template, ConferenceView) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        id: 'list',

        spinner: null,

        nbSpinner: 0,

        userModel: null,

        conferencesView: [],

        initialize: function(){
            this.listenTo(this.collection, 'add', this.onAddConference);
        },

        events: {
            'click .aboutButton' : 'onAbout',
            'click #createBtn': 'onCreate',
            'click #settingBtn': 'onSettings',
        },

        subscriptions: {
            'spinner-on': 'displaySpinner',
            'spinner-off': 'hideSpinner'
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

        setUserModel: function(model) {
            this.userModel = model;
            this.listenTo(this.userModel, 'change', this.onResetList);
        },

        onResetList: function() {
            while(this.conferencesView.length > 0) {
                var view = this.conferencesView.pop();
                view.close();
                view = null;
            }
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
            this.conferencesView.push(view);
        },

        displaySpinner: function() {
            
            if(!this.spinner) {
                var opts = {
                    lines: 9, // The number of lines to draw
                    length: 5, // The length of each line
                    width:4, // The line thickness
                    radius: 8,// The radius of the inner circle
                    corners: 0.9, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    color: '#fff', // #rgb or #rrggbb or array of colors
                    speed: 1, // Rounds per second
                    trail: 50, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: '93%', // Top position relative to parent
                    bottom: 80,
                    left: '50%' // Left position relative to parent
                };

                var target = document.getElementById('spinner');
                this.spinner = new Spinner(opts).spin(target);
                
                this.$('.copyright').html('');

            }


            
            this.nbSpinner++;
        },

        hideSpinner: function() {
            
            this.nbSpinner--;
            if(this.spinner && this.nbSpinner === 0) {
                this.spinner.stop();
                this.spinner = null; 
                this.$('.copyright').html('&copy;Alcatel-Lucent Enterprise - 2014');
            }
        }
    });
});