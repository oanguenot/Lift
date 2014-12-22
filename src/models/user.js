define('models/user', ['modules/credentials', 'modules/acsConnector'], function(credentials, acs) {

    return Backbone.Model.extend({

    	defaults: {
    		login: '',
    		password: '',
    		host: '',
    		isConnected: false
    	},

    	signin: function() {
    		credentials.load(function(user) {
            
	            log.debug("MAIN", "User found", user);

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
	                });
	            }
	            else {
	                //displayErrorLoginPopup(); 
	                Backbone.Mediator.publish('error-display');  
	            }
	        }, function() {
	            Backbone.Mediator.publish('error-display');
	        }, this);
    	}
    });
});