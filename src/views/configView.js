
define('views/configView', ['text!views/templates/config.html'], function(template) {

    return Backbone.View.extend({

        itemName: 'div',

        className: 'modalDialog visible',

        id: 'openModal',

        initialize: function(){
        },

        events: {
            'click .cancelSettingButton' : 'onCancelSignin',
            'click .loginButton': 'onSignin'
        },

        render: function() {
            this.$el.html(template);
            this.$('.popupSettings').i18n();
            return this;
        },

        displayInfo: function() {
            var that = this;

            //Read data from file
            loadDataFromFile().then(function(data) {
                that.$('#login').val(data.login || "");
                that.$('#password').val(data.password || "");
                that.$('#ot').val(data.host || "");
            }, function() {
                that.$('#login').val("");
                that.$('#password').val("");
                that.$('#ot').val("");
            });
        },

        close: function() {
            this.remove();
            this.undelegateEvents();
            this.unbind();
            this.off();
        },

        onCancelSignin: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Backbone.Mediator.publish('settings-cancel', null);
        },

        onSignin: function(e) {
            e.preventDefault();
            e.stopPropagation();  

            var signin = {
                login: this.$('#login').val(),
                password: this.$('#password').val(),
                internal_server: this.$('#ot').val()
            };

            saveDataToFile(signin.login, signin.password, signin.internal_server);

            Backbone.Mediator.pulish('settings-signin', signin);
        }
    });
});