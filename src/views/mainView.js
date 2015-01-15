define('views/mainView', ['text!views/templates/main.html', 'views/conferenceView', 'models/models'], function(template, ConferenceView, models) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        id: 'list',

        conferencesView: {},

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
            'click #activeBtn': 'onFilterLive',
            'click #not_begunBtn': 'onFilterSoon',
            'click #endedBtn': 'onFilterPast',
        },

        subscriptions: {
        },

        render: function() {
            this.$el.html(template);
            this.$('.mainScreen').i18n();
            this.enableCreateButton();
            this.showEmptyArea();
            this.selectPreviousFilterTab();
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
            var filteredCollection = this.collection.applyFilter();

            _.each(filteredCollection, function(model) {
                this.onAddConference(model);
            }, this);
        },

        onAddConference: function(model) {

            var filter = this.collection.getFilter();

            if(model.get('state') === filter || filter === 'all') {
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
            this.$('#endedBtn').addClass('selected');
            this.collection.setFilter("ended");
            this.updateConferences();
        },

        onFilterSoon: function() {
            this.removeFilter();
            this.$('#not_begunBtn').addClass('selected');
            this.collection.setFilter("not_begun");
            this.updateConferences();
        },

        onFilterLive: function() {
            this.removeFilter();
            this.$('#activeBtn').addClass('selected');
            this.collection.setFilter("active");
            this.updateConferences();
        },

        onFilterAll: function() {
            this.removeFilter();
            this.$('#allBtn').addClass('selected');
            this.collection.setFilter("all");
            this.updateConferences();
        },

        updateConferences: function() {
            this.resetConferencesList();
            this.displayConferences();
        },

        removeFilter: function() {
            this.$('#allBtn').removeClass('selected');
            this.$('#activeBtn').removeClass('selected');
            this.$('#not_begunBtn').removeClass('selected');
            this.$('#endedBtn').removeClass('selected');
        },

        selectPreviousFilterTab: function() {
            this.$('#' + this.collection.getFilter() + 'Btn').addClass('selected');
        }
    });
});