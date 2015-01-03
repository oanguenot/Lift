define('models/user', ['modules/credentials', 'modules/acsConnector', 'modules/log'], function(credentials, acs, log) {

    "use strict";

    return Backbone.Model.extend({

        defaults: {
            login: '',
            password: '',
            host: '',
            isConnected: false,
            error: false
        },

        isConnected: function() {
            return (this.get('isConnected'));
        },

        hasError: function() {
            return (this.get('error'));
        },

        getHost: function() {
        	return this.get('host');
        },

        signin: function() {

            Backbone.Mediator.publish('spinner-on');

            credentials.load(function(user) {
            
                log.debug("USER", "User found", user);

                this.set({
                    'login': user.login,
                    'password': user.password,
                    'host': user.host
                });

                if(user.host.length > 0 && user.login.length > 0 && user.password.length > 0) {
                    acs.loginToACS(user.host, user.login, user.password, function() {
                        Backbone.Mediator.publish('spinner-off');
                        this.set({'isConnected': true, 'error': false});
                    }, function() {
                        this.set({'isConnected': false, 'error': true});
                        Backbone.Mediator.publish('spinner-off');
                        Backbone.Mediator.publish('error-display'); 
                    }, this);
                }
                else {
                    this.set({'isConnected': false, 'error': true});
                    Backbone.Mediator.publish('spinner-off');
                    Backbone.Mediator.publish('error-display');  
                }
            }, function() {
                this.set({'isConnected': false, 'error': true});
                Backbone.Mediator.publish('spinner-off');
                Backbone.Mediator.publish('error-display');
            }, this);
        },

        update: function(newUserInfo) {
            this.set(newUserInfo);

            credentials.save(this.get('login'), this.get('password'), this.get('host'), function() {
                log.info("USER", "User data saved");

                if(this.get('isConnected')) {
                    acs.logoffFromACS(function() {
                        log.info("USER", "Signout ok, try to log...");
                        this.set({'isConnected': false});
                        this.signin();
                    }, function() {
                        log.info("USER", "Signout error, try to log...");
                        this.set({'isConnected': false});
                        this.signin();
                    }, this);   
                }
                else {
                    this.signin();
                }

            }, function() {

            }, this);

        },

        reload: function() {
            acs.logoffFromACS(function() {
                log.info("USER", "Signout ok, try to log...");
                this.set({'isConnected': false});
                this.signin();
            }, function() {
                log.info("USER", "Signout error, try to log...");
                this.set({'isConnected': false});
                this.signin();
            }, this);
        },

        join: function(vanity) {
            window.open("https://" + this.get('host') + "/call/" + vanity, "_blank");
        }
    });
});