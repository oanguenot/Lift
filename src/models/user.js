define('models/user', ['modules/credentials', 'modules/acsConnector', 'modules/log'], function(credentials, acs, log) {

    return Backbone.Model.extend({

        defaults: {
            login: '',
            password: '',
            host: '',
            isConnected: false
        },

        isConnected: function() {
            return (this.get('isConnected'));
        },

        signin: function() {
            credentials.load(function(user) {
            
                log.debug("USER", "User found", user);

                this.set({
                    'login': user.login,
                    'password': user.password,
                    'host': user.host
                });

                if(user.host.length > 0 && user.login.length > 0 && user.password.length > 0) {
                    acs.loginToACS(user.host, user.login, user.password, function() {
                        this.set({'isConnected': true});
                    }, function() {
                        this.set({'isConnected': false});
                        Backbone.Mediator.publish('error-display'); 
                    }, this);
                }
                else {
                    //displayErrorLoginPopup(); 
                    Backbone.Mediator.publish('error-display');  
                }
            }, function() {
                Backbone.Mediator.publish('error-display');
            }, this);
        },

        update: function(newUserInfo) {
            this.set(newUserInfo);

            this.save();
        },

        save: function() {
            credentials.save(this.get('login'), this.get('password'), this.get('host'), function() {
                log.info("USER", "User data saved");
            }, function() {

            }, this);
        },

        join: function(vanity) {
            window.open("https://" + this.get('host') + "/call/" + vanity, "_blank");
        }
    });
});