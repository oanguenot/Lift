define('views/editorView', ['text!views/templates/editor.html', 'modules/log', 'models/models'], function(template, log, models) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        isModified: false,

        initialize: function(){
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #scheduleBtn': 'onSchedule',
            'click .aboutButton': "onAbout"
        },

        subscriptions: {
            'editor-schedule-ok': 'onScheduleOk',
            'editor-schedule-error': 'onScheduleError'
        },

        render: function() {
            this.$el.html(template);
            this.$('.editor').i18n();

            this.$('.titleInput').val(i18n.t('editor.new'));
            this.$('.titleInput').attr('placeholder', i18n.t('editor.name-holder'));

            this.displayTimezones();
            this.fillOthersFields();

            this.addListeners();

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        addListeners: function() {
            var that = this;

            this.$('.dateInput').on('change', function() {
                var date = that.$('.dateInput').val();
                var end = that.$('.endDateInput').val();
                if (moment(date).isBefore(moment(new Date()))) {
                    that.$('.dateInput').val(new Date().toJSON().substring(0,10));
                }
                if(moment(end).isBefore(moment(date))) {
                    that.$('.endDateInput').val(new Date(date).toJSON().substring(0,10));
                }
            });

            this.$('.endDateInput').on('change', function() {
                var date = that.$('.endDateInput').val();
                var start = that.$('.dateInput').val();
                if (moment(date).isBefore(moment(start))) {
                    that.$('.endDateInput').val(new Date(start).toJSON().substring(0,10));
                }
            });

            this.$('.recurrenceType').on('change', function() {
                that.updateSelectors();
            });

            this.$('.conferenceType').on('change', function() {
                that.updateSelectors();
            });

            this.$('.passwordCheck').on('change', function(event) {
                that.$('.passwordInput').prop('disabled', !event.target.checked);
                if(!event.target.checked) {
                    that.$('.passwordInput').val('');
                }
            });
        },

        updateSelectors: function() {

            var recurrenceValue = this.$('.recurrenceType').val();
            var confType = this.$(".conferenceType").val();

            if(confType === "scheduled") {
                this.$('.durationInput').prop("disabled", false);
                this.$('.startTimeInput').prop("disabled", false);
                this.$(".startTimeInput").val(new Date().toLocaleTimeString().substr(0, 5));

                if(recurrenceValue === 'none') {
                    this.$('.endDateInput').prop("disabled", true);
                }
                else {
                    this.$('.endDateInput').prop("disabled", false);
                }
                this.$('.recurrenceType').prop("disabled", false);
            }
            else {
                this.$('.durationInput').prop("disabled", true);
                this.$('.startTimeInput').prop("disabled", true);
                this.$(".startTimeInput").val('00:00');

                this.$('.endDateInput').prop("disabled", false);
                this.$('.recurrenceType').prop("disabled", true);
            }
        },

        onCancel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('editor-close', null);
        },

        onSchedule: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var meeting = {
                type: this.$('.conferenceType').val(),
                title: this.$('.titleInput').val(),
                timezone: this.$('.timezoneType').val(),
                start: new Date(Date.parse(this.$(".dateInput").val() + " " + this.$(".startTimeInput").val())),
                end: new Date(Date.parse(this.$(".endDateInput").val() + " 23:59")),
                duration: this.$(".durationInput").val(),
                recurrence: this.$('.recurrenceType').val(),
                password: this.$(".passwordCheck").checked ? this.$('.passwordInput').val() : null,
                modify : this.isModified,
                profile: this.$('.profileType').val()
            };

            log.debug("EDITOR", "Schedule a meeting", meeting);

            Backbone.Mediator.publish('editor-schedule', meeting);
        },

        onAbout: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('editor-about', null);
        },

        displayTimezones: function() {
            var settings = models.settings();

            var timezones = settings.get('timezones');
            var defaultTimezone = settings.get('defaultTimezone');

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
        },

        onScheduleOk: function() {
            log.info("EDITOR", "Schedule ok");
        },

        onScheduleError: function() {
            log.info("EDITOR", "Schedule error");
        }
    });

});