define('views/editorView', ['text!views/templates/editor.html', 'modules/log', 'models/models', 'views/createOkView', 'views/modifyView', 'views/passwordView'], function(template, log, models, CreateOkView, ModifyView, PasswordView) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        isModified: false,

        vanity: null,

        initialize: function(){
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #scheduleBtn': 'onSchedule',
            'click .aboutButton': "onAbout",
            'click .webpassword': 'onWebPassword',
            'click .audiopassword': 'onAudioPassword'
        },

        subscriptions: {
            'editor-schedule-ok': 'onScheduleOk',
            'editor-schedule-error': 'onScheduleError',
            'editor-schedule-modify': 'onScheduleModify',
            'editor-schedule-right':'onScheduleErrorRight',
            'editor-schedule-badpassword': 'onScheduleErrorPassword'
        },

        render: function() {
            this.$el.html(template);
            this.$('.editor').i18n();

            this.$('.titleInput').val(i18n.t('editor.new'));
            this.$('.titleInput').attr('placeholder', i18n.t('editor.name-holder'));

            this.displayTimezones();
            this.fillOthersFields();

            this.addListeners();

            if(this.model) {
                this.isModified = true;
                this.$('#scheduleBtn').text(i18n.t('editor.change'));
                this.vanity = this.model.get('vanity');
                this.displayMeeting();
            }

            return this;
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        displayMeeting: function() {
            var model = this.model;

            this.$('.conferenceType').val(model.get('typeConf'));
            this.$('.titleInput').val(model.get('subject'));
            this.$('.timezoneType').val(model.get('timezone'));
            this.$('.profileType').val(model.get('profile'));
            this.$(".dateInput").val(model.get('startDate').format('YYYY-MM-DD'));
            this.$(".endDateInput").val(model.get('endDate').format('YYYY-MM-DD'));

            if(model.get('typeConf') === 'reservationless') {
                this.$('.recurrenceType').prop('disabled', true);
                this.$('.recurrenceType').val('none');
                this.$(".endDateInput").prop('disabled', false);
                this.$(".startTimeInput").val('00:00');
                this.$(".startTimeInput").prop('disabled', true);
                this.$(".durationInput").val(1);
                this.$(".durationInput").prop('disabled', true);
            }
            else {
                this.$('.recurrenceType').prop('disabled', false);
                this.$('.recurrenceType').val(model.get('recurrenceType'));
                this.$(".startTimeInput").val(model.get('hour') + ':' + this.model.get('minute'));
                this.$(".durationInput").val(model.get('duration'));
                if(model.get('recurrenceType') !== 'none') {
                    this.$(".endDateInput").prop('disabled', false);
                }
                else {
                    this.$(".endDateInput").prop('disabled', true);
                }
            }

            var hasPassword = false;
            if(model.get('password') && model.get('password').length > 0) {
                this.$('.passwordCheck').prop('checked', true);
                this.$('.passwordInput').val(model.get('password'));
                hasPassword = true;
            }

            if(model.get('audiopassword') && model.get('audiopassword').length > 0) {
                this.$('.passwordCheck').prop('checked', true);
                this.$('.audioInput').val(model.get('audiopassword'));
                hasPassword = true;
            }

            if(!hasPassword) {
                this.$('.passwordInput').prop('disabled', true);
            }
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
                that.$('.audioInput').prop('disabled', !event.target.checked);
                if(!event.target.checked) {
                    that.$('.passwordInput').val('');
                    that.$('.audioInput').val('');
                }
            });
        },

        updateSelectors: function() {

            var recurrenceValue = this.$('.recurrenceType').val();
            var confType = this.$(".conferenceType").val();

            if(confType === "scheduled") {
                this.$('.durationInput').prop("disabled", false);
                this.$('.startTimeInput').prop("disabled", false);
                this.$(".startTimeInput").val(moment().format("HH:mm"));

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
                this.$(".startTimeInput").val(moment().format("HH:mm"));

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
                password: this.$('.passwordCheck').prop('checked') ? this.$('.passwordInput').val() : null,
                audiopassword: this.$('.passwordCheck').prop('checked') ? this.$('.audioInput').val() : null,
                modify : this.vanity,
                isModified: this.isModified,
                profile: this.$('.profileType').val()
            };

            log.debug("EDITOR", "Schedule a meeting", meeting);

            models.conferences().schedule(meeting);
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
            this.$('.startTimeInput').val(moment().format("HH:mm"));
        },

        onScheduleOk: function(model) {
            log.info("EDITOR", "Schedule ok", model);
            var createOkView = new CreateOkView({model: model});

            Backbone.Mediator.subscribeOnce('createok-close', function() {
                createOkView.close();
                Backbone.Mediator.publish('editor-close');
            });

            $('#popup-elt').append(createOkView.render().el);
        },

        onScheduleError: function() {
            log.info("EDITOR", "Schedule error");
        },

        onScheduleErrorRight: function() {
            log.info("EDITOR", "No right to create the meeting");

            var view = new ModifyView();
            view.setError('noright');

            Backbone.Mediator.subscribeOnce('modifyok-close', function() {
                view.close();
            });

            $('#popup-elt').append(view.render().el);
        },

        onScheduleErrorPassword: function() {
            log.info("EDITOR", "Bad password for the meeting");

            var view = new ModifyView();
            view.setError('badpassword');

            Backbone.Mediator.subscribeOnce('modifyok-close', function() {
                view.close();
            });

            $('#popup-elt').append(view.render().el);
        },

        onScheduleModify: function(meeting) {
            log.info("EDITOR", "Schedule Modification ok", meeting);

            var view = new ModifyView({model: meeting});

            Backbone.Mediator.subscribeOnce('modifyok-close', function() {
                view.close();
                Backbone.Mediator.publish('editor-modify');
            });

            $('#popup-elt').append(view.render().el);
        },

        onWebPassword: function() {
            var view = new PasswordView();
            view.setInfo('web');

            Backbone.Mediator.subscribeOnce('password-close', function() {
                view.close();
            });

            $('#popup-elt').append(view.render().el);
        },

        onAudioPassword: function () {
            var view = new PasswordView();
            view.setInfo('audio');

            Backbone.Mediator.subscribeOnce('password-close', function() {
                view.close();
            });

            $('#popup-elt').append(view.render().el);
        }
    });

});