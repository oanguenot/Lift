define('models/user', ['modules/credentials', 'modules/acsConnector', 'modules/log'], function(credentials, acs, log) {

    "use strict";

    return Backbone.Model.extend({

        defaults: {
            login: '',
            password: '',
            host: '',
            loginExternal: '',
            passwordExternal: '',
            hostExternal: '',
            isConnected: false,
            error: false,
            errorType: ''
        },

        isConnected: function() {
            return (this.get('isConnected'));
        },

        hasError: function() {
            return (this.get('error'));
        },

        hasErrorOfTypeLogin: function() {
            return (this.get('errorType') === 403);
        },

        hasErrorOfTypeServerTooOld: function() {
            return (this.get('errorType') === 404);
        },

        signin: function() {

            Backbone.Mediator.publish('spinner-on');

            credentials.load(function(user) {
            
                log.debug("USER", "User found");

                this.set({
                    'login': user.login,
                    'password': user.password,
                    'host': user.host,
                    'loginExternal': user.loginExternal,
                    'passwordExternal': user.passwordExternal,
                    'hostExternal': user.hostExternal
                });

                //Try internal first
                if(user.host.length > 0 && user.login.length > 0 && user.password.length > 0) {
                    log.info("USER", "Try to log using internal information...");
                    acs.signin(user.host, user.login, user.password, function() {
                        Backbone.Mediator.publish('spinner-off');
                        this.set({'isConnected': true, 'error': false, 'errorType': ''});
                    }, function(errorType) {
                        //If error = 0, try external
                        if(errorType[0] === 0 && (user.loginExternal.length > 0 && user.passwordExternal.length > 0 && user.hostExternal.length > 0)) {
                            log.info("USER", "Try to log using external information...");

                            acs.signin(user.hostExternal, user.loginExternal, user.passwordExternal, function() {
                                Backbone.Mediator.publish('spinner-off');
                                this.set({'isConnected': true, 'error': false, 'errorType': ''});
                            }, function(errorType) {
                                this.set({'isConnected': false, 'error': true, 'errorType': errorType[0]});
                                Backbone.Mediator.publish('spinner-off');
                                Backbone.Mediator.publish('error-display');
                            }, this);
                        }
                        else {
                            this.set({'isConnected': false, 'error': true, 'errorType': errorType[0]});
                            Backbone.Mediator.publish('spinner-off');
                            Backbone.Mediator.publish('error-display'); 
                        }
                    }, this);
                }
                // If no internal information, try directly external if exist
                else if(user.loginExternal.length > 0 && user.passwordExternal.length > 0 && user.hostExternal.length > 0) {
                    log.info("USER", "Try to log using external information...");

                    acs.signin(user.hostExternal, user.loginExternal, user.passwordExternal, function() {
                        Backbone.Mediator.publish('spinner-off');
                        this.set({'isConnected': true, 'error': false, 'errorType': ''});
                    }, function(errorType) {
                        this.set({'isConnected': false, 'error': true, 'errorType': errorType[0]});
                        Backbone.Mediator.publish('spinner-off');
                        Backbone.Mediator.publish('error-display');
                    }, this);
                }
                // If information not complete
                else {
                    this.set({'isConnected': false, 'error': true, 'errorType': ''});
                    Backbone.Mediator.publish('spinner-off');
                    Backbone.Mediator.publish('error-display');  
                }
            }, function() {
                this.set({'isConnected': false, 'error': true, 'errorType': ''});
                Backbone.Mediator.publish('spinner-off');
                Backbone.Mediator.publish('error-display');
            }, this);
        },

        update: function(newUserInfo) {
            this.set(newUserInfo);

            credentials.save(this.get('login'), this.get('password'), this.get('host'), this.get('loginExternal'),this.get('passwordExternal'), this.get('hostExternal'), function() {
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

            Backbone.Mediator.publish('spinner-on');

            acs.logoffFromACS(function() {
                log.info("USER", "Signout ok, try to log...");
                this.set({'isConnected': false});
                acs.loginToACS(function() {
                    Backbone.Mediator.publish('spinner-off');
                    this.set({'isConnected': true, 'error': false, 'errorType': ''});
                }, function(errorType) {
                    Backbone.Mediator.publish('spinner-off');
                     this.set({'isConnected': false, 'error': true, 'errorType': errorType[0]});
                }, this);
            }, function() {
                log.info("USER", "Signout error, try to log...");
                this.set({'isConnected': false});
                acs.loginToACS(function() {
                    Backbone.Mediator.publish('spinner-off');
                    this.set({'isConnected': true, 'error': false, 'errorType': ''});
                }, function(errorType) {
                    Backbone.Mediator.publish('spinner-off');
                     this.set({'isConnected': false, 'error': true, 'errorType': errorType[0]});
                }, this);
            }, this);
        },

        join: function(vanity) {
            window.open("https://" + this.get('host') + "/call/" + vanity, "_blank");
        }
    });
});