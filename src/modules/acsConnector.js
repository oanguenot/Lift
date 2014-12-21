define('modules/acsConnector', ['modules/log'], function(log) {

	var protocol = 'http://',
		host = '';

	var request = function request(req) {
	    // Return a new promise.
	    return new Promise(function(resolve, reject) {

	        req += "&_nocachex=" + Math.floor(Math.random()*2147483647);

	        var http = new XMLHttpRequest();

	        var parts = req.split('?');

	        log.debug("ACSConnector", "Send request to ACS", parts[0]);

	        http.open("POST", parts[0], true);
	        http.setRequestHeader("Cache-Control", "no-cache");
	        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	        http.onreadystatechange = function () {
	            if (http.readyState === 4) {
	                if (http.status === 200) {  
	                    var res = null;

	                    var headers = http.getAllResponseHeaders();

	                    if(http.responseXML) {
	                        res = http.responseXML;
	                    }
	                    else if(http.responseText) {
	                        res = http.responseText;
	                    }
	                    
	                    var msg = {
	                        headers: headers,
	                        data: res
	                    };

	                    resolve(msg);
	                }
	                else {
	                    log.error("ACSConnector", "Receive", http);
	                    reject([null]);
	                }
	            } else {

	            }
	        };

	        http.send(parts[1]);

	    });
	};

	var login = function login(hostname, username, password) {

		if(!hostname && !username && !password) {
			return;
		}

		host = hostname;

		return new Promise(function(resolve, reject) {

	        log.debug("ACSConnector", "Login with", {login: username, host: hostname});

	        //Login with user data
	        var url = protocol + host + "/ics?action=signin&userid=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&remember_password=false&display=none";

	        request(url).then(function(jsonResponse) {
	            if(jsonResponse && jsonResponse.data !== null) {
	                
	                log.warning("ACSConnector", "Login not good");
	                reject();
	            }
	            else {
	                log.info("ACSConnector", "Login successfull");
	                resolve();
	            }
	            
	        }, function(err) {
	            log.error("ACSConnector", "Login", err);
	            reject();
	        });

	    });
	};

	return {

		/**
		 * Login to ACS
		 */

		loginToACS: function(host, username, password, callback, errCallback, context) {

			log.info("ACSConnector", "Try to log...");

			login(host, username, password).then(function(){
				callback.call(context);
			}, function() {
				errCallback.call(context);
			});
		}
	};

});