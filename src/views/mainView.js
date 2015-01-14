define('views/mainView', ['text!views/templates/main.html', 'views/conferenceView', 'models/models'], function(template, ConferenceView, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        id: 'list',

        conferencesView: {},

        filter: 'active',

        initialize: function(){
            this.listenTo(this.collection, 'add', this.onAddConference);
            this.listenTo(this.collection, 'remove', this.onRemoveConference);
            this.listenTo(this.collection, 'reset', this.resetConferencesList);
            this.listenTo(models.user(), 'change:isConnected', this.onConnectivityChange);
            this.listenTo(models.user(), 'change:error', this.onConnectionError);
        },

        events: {
            'click .aboutButton' : 'onAbout',
            'click #createBtn': 'onCreate',
            'click #settingBtn': 'onSettings',

            'click #allBtn': 'onFilterAll',
            'click #liveBtn': 'onFilterLive',
            'click #soonBtn': 'onFilterSoon',
            'click #pastBtn': 'onFilterPast',
        },

        subscriptions: {
        },

        render: function() {
            this.$el.html(template);
            this.$('.mainScreen').i18n();
            this.enableCreateButton();
            this.showEmptyArea();
            this.displayConferences();
            return this;
        },

        close: function() {
            this.resetConferencesList();
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        setUserModel: function(model) {
            this.userModel = model;
        },

        onConnectivityChange: function() {
            this.resetConferencesList();

            this.enableCreateButton();

            this.showEmptyArea();
        },

        resetConferencesList: function() {
            for(var vanity in this.conferencesView) {
                this.conferencesView[vanity].close();
                this.conferencesView[vanity] = null;
                delete this.conferencesView[vanity];
            }
            this.showEmptyArea();
        },

        onConnectionError: function() {
            if(models.user().hasError()) {
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
            var filteredCollection = this.collection.applyFilter(this.filter);

            _.each(filteredCollection, function(model) {
                this.onAddConference(model);
            }, this);
        },

        onAddConference: function(model) {
            if(model.get('state') === this.filter || this.filter === 'all') {
                this.hideEmptyArea();
                var view = new ConferenceView({model: model});
                this.$('.meetings').append(view.render().el);
                this.conferencesView[model.get('vanity')] = view; 
            }
        },

        onRemoveConference: function(model) {
            var vanity = model.get('vanity');
            if(vanity in this.conferencesView) {
                this.conferencesView[vanity].close();
                this.conferencesView[vanity] = null;
                delete this.conferencesView[vanity];

                if(_.size(this.conferencesView) === 0) {
                    this.showEmptyArea();
                }
            }
        },

        onFilterPast: function() {
            this.removeFilter();
            this.$('#pastBtn').addClass('selected');
            this.resetConferencesList();
            this.filter = "ended";
            this.displayConferences();
        },

        onFilterSoon: function() {
            this.removeFilter();
            this.$('#soonBtn').addClass('selected');
            this.resetConferencesList();
            this.filter = "not_begun";
            this.displayConferences();
        },

        onFilterLive: function() {
            this.removeFilter();
            this.$('#liveBtn').addClass('selected');
            this.resetConferencesList();
            this.filter = "active";
            this.displayConferences();
        },

        onFilterAll: function() {
            this.removeFilter();
            this.resetConferencesList();
            this.filter = "all";
            this.displayConferences();
            this.$('#allBtn').addClass('selected');
        },

        removeFilter: function() {
            this.$('#allBtn').removeClass('selected');
            this.$('#liveBtn').removeClass('selected');
            this.$('#soonBtn').removeClass('selected');
            this.$('#pastBtn').removeClass('selected');
        }
    });
});