define('views/editorView', ['text!views/templates/editor.html'], function(template) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        settings: null,

        initialize: function(){
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #scheduleBtn': 'onSchedule',
            'click .aboutButton': "onAbout"
        },

        render: function() {
            this.$el.html(template);
            this.$('.editor').i18n();

            this.$('.titleInput').val(i18n.t('editor.new'));
            this.$('.titleInput').attr('placeholder', i18n.t('editor.name-holder'));

            this.displayTimezones();
            this.fillOthersFields();
            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onCancel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('editor-close', null);
        },

        onSchedule: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('editor-schedule', null);
        },

        onAbout: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('editor-about', null);
        },

        setSettings: function(settings) {
            this.settings = settings;
        },

        displayTimezones: function() {
            var timezones = this.settings.get('timezones');
            var defaultTimezone = this.settings.get('defaultTimezone');

            if(timezones) {
                var selected = false;
                for (var i = 0, l=timezones.length; i<=l; i++){
                    selected = timezones[i] === defaultTimezone;
                    this.$('.timezoneType').append(new Option(timezones[i], timezones[i], selected, selected));
                }
            }
        },

        fillOthersFields: function() {
            var date = new Date();
            this.$('.dateInput').val(date.toJSON().substring(0,10));
            this.$('.endDateInput').val(date.toJSON().substring(0,10));
            this.$('.startTimeInput').val(date.toLocaleTimeString().substr(0, 5));
        }
    });

});