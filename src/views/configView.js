
define('views/configView', ['text!views/templates/config.html'], function(template) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'div',

        className: 'modalDialog visible',

        id: 'openModal',

        initialize: function(){
        },

        events: {
            'click .cancelBtn' : 'onCancel',
            'click .saveBtn': 'onSave'
        },

        render: function() {

            this.$el.html(template);
            this.$('.popupSettings').i18n();
            this.displayInfo();
            return this;
        },

        displayInfo: function() {
            this.$('#login').val(this.model.get('login') || "");
            this.$('#password').val(this.model.get('password') || "");
            this.$('#ot').val(this.model.get('host') || "");

            this.$('#loginExternal').val(this.model.get('loginExternal') || "");
            this.$('#passwordExternal').val(this.model.get('passwordExternal') || "");
            this.$('#otExternal').val(this.model.get('hostExternal') || "");
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
            Backbone.Mediator.publish('settings-close', null);
        },

        onSave: function(e) {
            e.preventDefault();
            e.stopPropagation();  

            this.model.update({
                login:  this.$('#login').val(),
                password: this.$('#password').val(),
                host: this.$('#ot').val(),
                loginExternal: this.$('#loginExternal').val(),
                passwordExternal: this.$('#passwordExternal').val(),
                hostExternal: this.$('#otExternal').val()
            });

            Backbone.Mediator.publish('settings-close', null);
        }
    });
});