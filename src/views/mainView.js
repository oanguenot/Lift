define('views/mainView', ['text!views/templates/main.html', 'views/conferenceView', 'models/models'], function(template, ConferenceView, models) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        id: 'list',

        spinner: null,

        nbSpinner: 0,

        conferencesView: {},

        initialize: function(){
            this.listenTo(this.collection, 'add', this.onAddConference);
            this.listenTo(this.collection, 'remove', this.onRemoveConference);
            this.listenTo(models.user(), 'change', this.onConnectivityChange);
        },

        events: {
            'click .aboutButton' : 'onAbout',
            'click #createBtn': 'onCreate',
            'click #settingBtn': 'onSettings',
        },

        subscriptions: {
            'spinner-on': 'displaySpinner',
            'spinner-off': 'hideSpinner',
            'conference-remove': 'onConferenceToRemove'
        },

        render: function() {
            this.$el.html(template);
            this.$('.mainScreen').i18n();
            this.enableCreateButton();
            this.displayConferences();
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
            
        },

        onConnectivityChange: function() {
            for(var vanity in this.conferencesView) {
                this.conferencesView[vanity].close();
                this.conferencesView[vanity] = null;
                delete this.conferencesView[vanity];
            }

            this.enableCreateButton();

            this.showEmptyArea();

            if(!models.user().isConnected()) {
                this.$('.errorMessage').removeClass('masked');
            }
            else {
                this.$('.errorMessage').addClass('masked');
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

        onConferenceToRemove: function(model) {
            this.collection.delete(model);
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

        enableCreateButton: function() {
             this.$('#createBtn').prop("disabled", !models.user().isConnected());
        },

        displayConferences: function() {
            this.collection.each(function(model) {
                this.onAddConference(model);
            }, this);
        },

        onAddConference: function(model) {
            this.hideEmptyArea();
            var view = new ConferenceView({model: model});
            this.$('.meetings').append(view.render().el);
            this.conferencesView[model.get('vanity')] = view;
        },

        onRemoveConference: function(model) {
            var vanity = model.get('vanity');
            this.conferencesView[vanity].close();
            this.conferencesView[vanity] = null;
            delete this.conferencesView[vanity];
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