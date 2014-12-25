define('views/editorView', ['text!views/templates/editor.html'], function(template) {

    return Backbone.View.extend({

        tagName: 'div',

        className: 'displayed',

        initialize: function(){
        },

        events: {
            'click #cancelBtn': 'onCancel',
            'click #scheduleBtn': 'onSchedule',
            'click .aboutButton': "onAbout"
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
        }
    });

});