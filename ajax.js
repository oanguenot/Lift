/**
 * Send an ajax request to ACS
 * Using promise
 */
function request(req) {
  	// Return a new promise.
  	return new Promise(function(resolve, reject) {

  		req += "&_nocachex=" + Math.floor(Math.random()*2147483647);

		var http = new XMLHttpRequest;

		var parts = req.split('?');

		http.open("POST", parts[0], true);
		http.setRequestHeader("Cache-Control", "no-cache");
		http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function (arg) {
			if (http.readyState == 4) {
				if (http.status === 200) {  
					var res = null;

					var headers = http.getAllResponseHeaders();

					if(http.responseXML) {
						res = http.responseXML;
						console.log(http);
					}
					else if(http.responseText) {
						res = http.responseText;
						console.log(http);
					}
					
					var msg = {
						headers: headers,
						data: res
					};

					//callback.apply(context, [res]);
					resolve([msg]);
				}
				else {
					console.log("--- Error", http);
					reject([null]);
					//errorCallback.apply(context, [null]);
				}
			} else {
				//console.log("--- Status: ", http.status, http.readyState, http);
				//errorCallback.apply(context, [null]);
			}
		};

		http.send(parts[1]);

	});
}


function sendRequest(req, callback, errorCallback, context) {

	
};

/**
 * Log off from ACS
 */
function logoff() {

	return new Promise(function(resolve, reject) {

		console.log("--logoff");

		// Logout previous user - if any
		var url = "http://" + host_param + "/ics?action=signout";

		request(url).then(function(res) {
			console.log("--logOff Successfull");
			resolve();
		}, function(err) {
			console.log("--logOff Error", err);
			reject();
		});

	});
};


/**
 * Log in to ACS
 */
function login() {

	return new Promise(function(resolve, reject) {

		console.log("--login");
	
		//Login with user data
		var url = "http://" + host_param +"/ics?action=signin&userid=" + encodeURIComponent(login_param) + "&password=" + encodeURIComponent(password_param) + "&remember_password=false&display=none";

		request(url).then(function() {
			console.log("--logIn Successfull");
			resolve();
		}, function(err) {
			console.log("--logIn Error", err);
			reject();
		});

		//	sendRequest(url, getGlobalSettings, errorLogin, that);

	});
};
