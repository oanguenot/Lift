
/**
 * Copyright (C) <2013> <Alcatel-Lucent Enterprise>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Version 0.3:
 * - Read timezone from vcs?settings=global
 * - Fix issue with notification. Only displayed if possible
 * - Fix issue with start time (use toLocaleTimeString() function instead of to JSONString() function)
 * - Fix issue with Date&Time not taken into account
 * - Fix issue with bard parameters sent to vcs_conf_schedule API
 *
 * Version 0.2:
 * - Version compliant to Chrome Extension
 *
 * Version 0.1:
 * - First version
 */


var login_param = localStorage["lift_login"];
var password_param = localStorage["lift_password"];
var host_param = localStorage["lift_host"];

var timezone = "Europe/Paris";
var confType = "scheduled";
var recurrenceValue = 'none';

var that = this;
var isNotificationAllowed = false;

var STATE = 'disconnected';
var loaded = false;

var startMeeting = new Date();
var spinner = null;

/**
 * Initialize
 */
function init() {

	console.log("--init");

	var loginField = document.querySelector('#login');
	var passwordField = document.querySelector('#password');
	var otField = document.querySelector('#ot');
	var btn = document.querySelector("#scheduleBtn");
	var startDate = document.querySelector('.dateInput');
	var endDate = document.querySelector('.endDateInput');
	var recurrence = document.querySelector('.recurrenceType');
	var confTypeElt = document.querySelector(".conferenceType");
	var confPassword = document.querySelector('.passwordCheck');
	var loginButton = document.querySelector('.loginButton');
	var closeButton = document.querySelector('#closeButton');
	var clearButton = document.querySelector('#clearButton');

	var editor = document.querySelector('#editor');

	var meetings = document.querySelector('#list');
	var createBtn = document.querySelector('#createBtn');

	var cancelBtn = document.querySelector('#cancelBtn');
	
	//if ( (window.webkitNotifications) && (window.webkitNotifications.checkPermission() == 0) ) {
	//	isNotificationAllowed = true;
	//	console.log("Notification allowed");
	//}
	//else {
	//	console.log("request");
	//	window.webkitNotifications.requestPermission();
	//}
	
	btn.onclick = function(event){
		event.preventDefault();
		event.stopPropagation();

		if(login_param && password_param && host_param) {
			login();
		}
		else {
			if(isNotificationAllowed) {
				var notification = webkitNotifications.createNotification(
			        'otc_48.png',  
			        'OTC Conference Scheduler',  
			        'You have to open the Options for configuring your parameters (user, server).'
			    );

			    notification.show();
			}
			else {
				console.log('You have to open the Options for configuring your parameters (user, server).');
			}
		}
	};

	startDate.onchange = function() {
		var date = startDate.value;
		var end = endDate.value;
		if (moment(date).isBefore(moment(startMeeting))) {
			startDate.value = startMeeting.toJSON().substring(0,10);
		}
		if(moment(end).isBefore(moment(date))) {
			console.log("Date", date);
			endDate.value = new Date(date).toJSON().substring(0,10);
		}
	};
	
	endDate.onchange = function() {
		var date = endDate.value;
		var start = startDate.value;
		console.log("date", date, start);
		if (moment(date).isBefore(moment(start))) {
			endDate.value = new Date(start).toJSON().substring(0,10);
		}
	};
	
	recurrence.onchange = function() {
		recurrenceValue = recurrence.value;
		updateGUI();
	}
	
	confTypeElt.onchange = function(event) {
		confType = confTypeElt.value;
		updateGUI();
	};
	
	confPassword.onchange = function(event) {
		document.querySelector('.passwordInput').disabled = !event.target.checked;
		if(!event.target.checked) {
			document.querySelector('.passwordInput').value = '';
		}
	};

	
	loginButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		localStorage["lift_login"] = loginField.value;
    	localStorage["lift_password"] = passwordField.value;
    	localStorage["lift_host"] = otField.value;

    	var modal= document.querySelector('#openModal');
		modal.classList.remove('visible');

		var editor= document.querySelector('.editor');
		editor.classList.remove('blur');
	};

	checkLoginButton = function() {
		if(loginField.value.length && passwordField.value.length && otField.value.length) {
			loginButton.disabled = false;
		}
		else {
			loginButton.disabled = true;
		}
	};
	
	login.onkeyup = function() {
		checkLoginButton();
	};

	password.onkeyup = function() {
		checkLoginButton();
	};

	ot.onkeyup = function() {
		checkLoginButton();
	};

	closeButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		var error= document.querySelector('#errorModal');
		error.classList.remove('visible');

		var editor= document.querySelector('.editor');
		editor.classList.remove('blur');
	};

	clearButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		var ok= document.querySelector('#okModal');
		ok.classList.remove('visible');

		var editor= document.querySelector('.editor');
		editor.classList.remove('blur');
	};

	createBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		meetings.classList.remove('displayed');
		meetings.classList.add('masked');
		editor.classList.remove('masked');
		editor.classList.add('displayed');
	};

	cancelBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		editor.classList.remove('displayed');
		editor.classList.add('masked');
		meetings.classList.add('displayed');
		meetings.classList.remove('masked');
	};

	document.querySelector(".dateInput").value = startMeeting.toJSON().substring(0,10);
	/* __FIX__ Use toLocaleTimeString() instead of toJSONString() to avoid issue with GMT+xxx */
	document.querySelector(".startTimeInput").value = startMeeting.toLocaleTimeString().substr(0, 5);

	document.querySelector(".endDateInput").value = startMeeting.toJSON().substring(0,10);

};


function updateGUI() {
	console.log("confType, recurrence", confType, recurrenceValue);
	if(confType == "scheduled") {
		document.querySelector('.durationInput').disabled = false;
		document.querySelector('.startTimeInput').disabled = false;
		document.querySelector(".startTimeInput").value = startMeeting.toLocaleTimeString().substr(0, 5);

		if(recurrenceValue === 'none') {
			document.querySelector('.endDateInput').disabled = true;
		}
		else {
			document.querySelector('.endDateInput').disabled = false;
		}
		document.querySelector('.recurrenceType').disabled = false;
	}
	else {
		document.querySelector('.durationInput').disabled = true;
		document.querySelector('.startTimeInput').disabled = true;
		document.querySelector(".startTimeInput").value = "00:00";

		document.querySelector('.endDateInput').disabled = false;
		document.querySelector('.recurrenceType').disabled = true;
	}
}

/* ------------------------------------------ Cookie management ------------------------------------- */

/**
 * create cookie
 */
function createCookie(name,value,days) {
	try {
		var expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			expires = "; expires="+date.toGMTString();
		}
		else {
			expires = "";
		}
		document.cookie = name+"="+value+expires+"; path=/";
	} catch (err) {
		console.log("error create cookie:" + err);
	}
};

/**
 * read cookie
 */
function readCookie(name) {
	try {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1,c.length);
			}
			if (c.indexOf(nameEQ) == 0) {
				return c.substring(nameEQ.length,c.length);
			}
		}
		return null;
	} catch (err) {
		console.log("error read cookie:" + err);
	}
};

/**
 * delete cookie
 */
function eraseCookie(name) {
	try {
		var value = readCookie(name);
		if (value) {
			createCookie(name, value, -1);
			return true;
		}
		return false;
	} catch (err) {
		console.log("error erase cookie:" + err);
	}
};

/**
 * delete all created cookies
 */
function deletePreviouslyUsedCookies() {

	console.log("--deletePreviouslyUsedCookies");

	eraseCookie("AlcUserId");
	eraseCookie("OTUCSSO");
	eraseCookie("ed_client_tag.");
	eraseCookie("ics.login.0.");
	eraseCookie("ics.login.1.");
	eraseCookie("ics.login.2.");
	eraseCookie("edial_vcs2.login");
	eraseCookie("edial_vcs2.login_persistent");
	eraseCookie("ed_client_guid.");
	eraseCookie("edial_vcs2.remember_pw");
	eraseCookie("ed_usernum");
};

/* ------------------------------------- Ajax request ----------------------------------------------- */

/**
 * Send an ajax request to ACS
 */
function sendRequest(req, callback, context) {

	req += "&_nocachex=" + Math.floor(Math.random()*2147483647);

	var http = new XMLHttpRequest;

	var parts = req.split('?');

	http.open("POST", parts[0], true);
	http.setRequestHeader("Cache-Control", "no-cache");
	http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function (arg) {
		if (http.readyState == 4) {
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
			
			if(callback) {

				var msg = {
					headers: headers,
					data: res
				};

				//callback.apply(context, [res]);
				callback.apply(context, [msg])
			}
		}
	};

	http.send(parts[1]);
};

/* ----------------------------------------- ACS functions used --------------------------------------- */

/**
 * Schedue a conference
 */
function schedule_conference() {

	console.log("--schedule_conference");

	var conf_title = document.querySelector(".titleInput").value;
	var conf_date = document.querySelector(".dateInput").value;
	var conf_time = document.querySelector(".startTimeInput").value;
	var conf_duration = document.querySelector(".durationInput").value;

	var timestamp = Date.parse(conf_date + " " + conf_time);
	var date_start = new Date(timestamp);

	var end = document.querySelector(".endDateInput").value;
	timestamp = Date.parse(end + " " + "23:59");
	date_end = new Date(timestamp);

	var day = getDay(moment(date_start).day() + 1);

	var hasPassword = document.querySelector(".passwordCheck").checked;

	var url = "http://" + host_param + 
		"/cgi-bin/vcs_conf_schedule?" + 
		"conf_type=" + confType + 
		"&no_audio=false" + 
		"&calling_disabled=false" + 
		"&create_callback=true" + 
		"&timezone=" + timezone +  
		"&start_year=" + date_start.getFullYear() + 
		"&start_month=" + (date_start.getMonth()+1) +
		"&start_day=" + date_start.getDate();
	
		if(confType == "scheduled") {
			url += "&start_hour=" + date_start.getHours() +
			"&start_min=" + date_start.getMinutes() +
			"&start_sec=" + date_start.getSeconds() +
			"&duration_hours=" + conf_duration;

			switch (recurrenceValue) {
				case 'none':
					url += "&num_occurrences=1";
				break;
				case 'day':
					url += "&recurrence=D-WE"+
					"&end_year=" + date_end.getFullYear() +  
					"&end_month=" + (date_end.getMonth()+1) +
					"&end_day=" + date_end.getDate() +
					"&end_hour=" + date_end.getHours() +
					"&end_min=" + date_end.getMinutes() +
					"&end_sec=" + date_end.getSeconds(); 
				break;
				case 'week':
					url += "&recurrence=W-1-" + day + 
					"&end_year=" + date_end.getFullYear() +  
					"&end_month=" + (date_end.getMonth()+1) +
					"&end_day=" + date_end.getDate() +
					"&end_hour=" + date_end.getHours() +
					"&end_min=" + date_end.getMinutes() +
					"&end_sec=" + date_end.getSeconds(); 
				break;
			}

			if(recurrenceValue === 'none') {
				 
			}
			else {

			}

			//"&end_year=" + date_end.getFullYear() +  
			//"&end_month=" + (date_end.getMonth()+1) +
			//"&end_day=" + date_end.getDate() +
			//"&end_hour=" + date_end.getHours() +
			//"&end_min=" + date_end.getMinutes() +
			//"&end_sec=" + date_end.getSeconds();




		}
		else {
			
			
			url += "&start_hour=0" +
			"&start_min=0" +
			"&start_sec=0" +
			"&end_year=" + date_end.getFullYear() +  
			"&end_month=" + (date_end.getMonth()+1) +
			"&end_day=" + date_end.getDate() +
			"&end_hour=" + date_end.getHours() +
			"&end_min=" + date_end.getMinutes() +
			"&end_sec=" + date_end.getSeconds(); 
		}

		url += "&subject=" + conf_title;

		if(hasPassword) {
			var password = document.querySelector('.passwordInput').value;
			url += "&web_password=" + password;
			url += "&audio_password=" + password;
		}

	sendRequest(url, displayResult, that);
};

/**
 * Log in to ACS
 */
function login() {

	console.log("--login");
	
	var url = "http://" + host_param +"/ics?action=signin&userid=" + encodeURIComponent(login_param) + "&password=" + encodeURIComponent(password_param) + "&remember_password=false&display=none";

	sendRequest(url, getGlobalSettings, that);
};

/**
 * Check the login with the ACS
 */
function checkLogin(host, login, password, callback, context) {

	console.log("--checkLogin");
	
	var url = "http://" + host +"/ics?action=signin&userid=" + encodeURIComponent(login) + "&password=" + encodeURIComponent(password) + "&remember_password=false&display=none";

	sendRequest(url, function(msg) {

		if(!msg.headers && msg.headers.length > 0) {
			if(msg.data && msg.data.length > 0) {
				callback.call(this, true);
			}
			else {
				callback.call(this, false);
			}
		}
		else {
			callback.call(this, false);
		}

	}, this);
};

/**
 * Log off from ACS
 */
function logoff() {

	console.log("--logoff");

	var url = "http://" + host_param + "/ics?action=signout";

	sendRequest(url, deletePreviouslyUsedCookies, that);
};

function getGlobalSettings() {

	console.log("--getGlobalSettings");
	/* __FIX__ Get the timezone */
	var url = "http://" + host_param + "/cgi-bin/vcs?settings=global";
	sendRequest(url, onGlobalSettingsReceived, that);
};

function list() {

	displaySpinner();

	var url = "http://" + host_param + "/cgi-bin/vcs?all_vanities=true";
	sendRequest(url, displayMeetings, that);
};

function deleteConference(vanity) {
	displaySpinner();

	var url = "http://" + host_param + "/cgi-bin/vcs_conf_delete?delete_vanity=" + vanity + "&all_vanities=true";
	sendRequest(url, displayMeetings, that);
};

function onGlobalSettingsReceived(response) {

	var xml = response.data;

	timezone = xml.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;

	list();

	//schedule_conference();
};

/**
 * Display result of scheduled conference
 */
function displayResult(response) {

	console.log("--displayResult");

	var xml = response.data;

	logoff();

	if(xml) {

		var code = xml.getElementsByTagName("message")[0].getAttribute("type");
		if(code == "error") {
			var reason = xml.getElementsByTagName("message")[0].children[0].innerHTML;

		    var err = document.querySelector('.error');
		    err.innerHTML = reason;

			var error= document.querySelector('#errorModal');
			error.classList.add('visible');

			var editor= document.querySelector('.editor');
			editor.classList.add('blur');
		}
		else {
			// Search for "url", first one leader, second participant, behind the /call/
			var callVanityLeader = xml.getElementsByTagName("url")[0].childNodes[0].textContent.slice(6);
			var callVanityParticipant = xml.getElementsByTagName("url")[1].childNodes[0].textContent.slice(6);
			//var vanity = xml.getElementsByTagName("data")[0].childNodes[0].nodeValue;

			var urlLeader = "http://" + xml.getElementsByTagName("domain")[0].childNodes[0].nodeValue + 
						xml.getElementsByTagName("join_url_root")[0].childNodes[0].nodeValue + 
						callVanityLeader;

			var urlParticipant = "http://" + xml.getElementsByTagName("domain")[0].childNodes[0].nodeValue + 
						xml.getElementsByTagName("join_url_root")[0].childNodes[0].nodeValue + 
						callVanityParticipant;

			// Update leader information
			document.querySelector('.leader').innerHTML = 'Leader code = ' + callVanityLeader;
			
			var a=document.createElement("a");
			a.href = urlLeader;
			a.innerHTML = urlLeader;
			a.onclick = function() {
				window.open(urlLeader,"_blank"); 
			}

			var leaderNode = document.querySelector('.leaderURL');
			while (leaderNode.firstChild) {
    			leaderNode.removeChild(leaderNode.firstChild);
    		}

			leaderNode.appendChild( a );
			
			// Update Participant information
			document.querySelector('.participant').innerHTML = 'Participant code = ' + callVanityParticipant;
			
			var b=document.createElement("a");
			b.href = urlParticipant;
			b.innerHTML = urlParticipant;
			b.onclick = function() {
				window.open(urlParticipant,"_blank"); 
			}

			var participantNode = document.querySelector('.participantURL');
			while (participantNode.firstChild) {
    			participantNode.removeChild(participantNode.firstChild);
    		}
			participantNode.appendChild( b );

			var ok= document.querySelector('#okModal');
			ok.classList.add('visible');

			var editor= document.querySelector('.editor');
			editor.classList.add('blur');
		}
	}
	else {
		if(isNotificationAllowed) {
			var notification = webkitNotifications.createNotification(
		        'otc_48.png',  
		        'OTC Conference Scheduler',  
		        'Conference can\'t be scheduled. Check your parameters and try again!'
		    );

		    notification.show();
		}
		else {
			console.log("Conference can\'t be scheduled. Check your parameters and try again!");
		}
	}

	
}

function displayMeetings(response) {

	var xml = response.data;

	if(xml) {
		var conference = xml.getElementsByTagName("conference");

		//var number = document.querySelector(".conferenceNumber");
		//number.innerHTML = "<b>" + conference.length + "</b>";

		// Initialize or delete all conferences displayed in list
		var list = document.querySelector("#meetings");
		list.innerHTML = "";

		for(var i=0, len=conference.length;i<len;i++) {
			displayMeeting(conference[i]);
		}
	}

	hideSpinner();
};

function displayMeeting(xml) {

	var list = document.querySelector("#meetings");

	console.log(xml);

	var typeConf = xml.getAttribute("type");
	console.log(typeConf);

	var subject = "Unnamed";
	if(xml.getElementsByTagName("subject")[0]) {
		subject = xml.getElementsByTagName("subject")[0].childNodes[0].nodeValue;
	}
	var from = xml.getElementsByTagName("owner")[0].childNodes[0].nodeValue;
	var name = from.substr(0, from.indexOf('@'));
	var company = from.substring(from.indexOf('@') + 1);
	var day = xml.getElementsByTagName("day")[0].childNodes[0].nodeValue;
	var month = xml.getElementsByTagName("month")[0].childNodes[0].nodeValue;
	var year = xml.getElementsByTagName("year")[0].childNodes[0].nodeValue;
	var day_end = xml.getElementsByTagName("day")[1].childNodes[0].nodeValue;
	var month_end = xml.getElementsByTagName("month")[1].childNodes[0].nodeValue;
	var year_end = xml.getElementsByTagName("year")[1].childNodes[0].nodeValue;

	var hasRecurrence = false;
	var recurrenceType = "";
	if(xml.getElementsByTagName("recurrence").length > 0) {
		hasRecurrence = true;
		recurrenceType = xml.getElementsByTagName("recurrence")[0].getAttribute('type');
	}
	
	var hour = xml.getElementsByTagName("hour")[0].childNodes[0].nodeValue;
	if(parseInt(hour) == 0)  {
		hour = "00";
	} else if (parseInt(hour) < 10) {
		hour = "0" + hour;
	}
	
	var minute = xml.getElementsByTagName("minute")[0].childNodes[0].nodeValue;
	if(parseInt(minute) == 0) {
		minute = "00";
	} else if (parseInt(minute) < 10) {
		minute = "0" + minute;
	}

	var hour_end = xml.getElementsByTagName("hour")[1].childNodes[0].nodeValue;
	if(parseInt(hour_end) == 0) {
		hour_end = "00";
	} else if(parseInt(hour_end) < 10) {
		hour_end = "0" + hour_end;
	}
	
	var minute_end = xml.getElementsByTagName("minute")[1].childNodes[0].nodeValue;
	if(parseInt(minute_end) == 0) {
		minute_end = "00";
	} else if(parseInt(minute_end) < 10) {
		minute_end = "0" + minute_end;
	}

	var timezone = xml.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;
	var vanity = xml.getElementsByTagName("vanity")[0].childNodes[0].nodeValue;

	var state = xml.getElementsByTagName("access")[1].getAttribute("state");
	var stateDisplayed = capitaliseFirstLetter(state);

	var startDate = moment(year + '-' + month + '-' + day);
	var endDate = moment(year_end + '-' + month_end + '-' + day_end);

	var startDateString = moment(startDate).format("ddd, MMMM Do");
	if(hasRecurrence) {
		switch (recurrenceType) {
			case "weekly":
				startDateString = "Each " + moment(startDate).format("dddd") + " since " + moment(startDate).format("MMMM Do");
				break;
			case "daily":
				startDateString = "Every Week Day from " + startDateString;
				break;
		}
	}
	
	var item = document.createElement("li");
	item.className = "buddies-item";
	item.innerHTML += '<span class="meetingTitle">' + subject + '</span>';
	item.innerHTML += '<span class="meetingState">' + stateDisplayed + '</span>';


	item.innerHTML += '<span class="meetingStartDate">'+ startDateString + '</span>';
	if(typeConf == "scheduled") {
		item.innerHTML += '<span class="meetingTime">' + hour + ":" + minute + "-" + hour_end + ":" + minute_end + '</span>';
		item.innerHTML += '<span class="meetingTimezone">' + timezone + '</span>';
	}
	else {
		item.innerHTML += '<span class="meetingTime">' + moment(endDate).format("ddd, MMMM Do") + '</span>';
		item.innerHTML += '<span class="meetingTimezone">' + "Reservationless" + '</span>';
	}
	
	var removeID = "remove-" + vanity;

	item.innerHTML += '<button type="action" id="' + removeID + '" class="actionButton meetingRemoveButton">Remove</button>';


	//item.innerHTML += '<img class="' + vanityCls + '" src="control_close.png" style="bottom: 44px; right: 16px; width: 27x; height: 27px; position:absolute;">';

	//item.setAttribute("data-buddies", "userid");
	item.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		var answer = confirm("Join the conference '" + subject + "' ?");
		if(answer) {
			join(vanity);
		}
	});


	//item.innerHTML = participantAdded.nickname;
	list.appendChild(item);

	remove = document.querySelector("#" + removeID);
	remove.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		var answer = confirm("Are you sure you want to remove this Meeting '" + subject + "' ?");
		if(answer) {
			deleteConference(vanity);
		}
	});
	
};




/* ----------------------------------------- ON LOAD ---------------------------------------------- */

/**
 * When page is loaded, start the extension
 */
document.addEventListener('DOMContentLoaded', function () {
	if(!loaded) {
		onLoad();
		loaded = true;
	}
});

function onLoad() {
	// Delete all previously used cookie
	deletePreviouslyUsedCookies();

  	// Initialize the extension
  	init();

  	if(login_param && password_param && host_param) {
			login();
	}
	else {
		editConfig();
	}
};

function editConfig() {
	setTimeout(function() {
		var login= document.querySelector('#openModal');
		login.classList.add('visible');

		var editor= document.querySelector('.editor');
		editor.classList.add('blur');
	}, 1000);
};

function getDay(day) {
	switch (day) {
		case 1:
			return 'SUN';
		case 2:
			return 'MON';
		case 3:
			return 'TUE';
		case 4:
			return 'WED';
		case 5:
			return 'THU';
		case 6:
			return 'FRI';
		case 7:
			return 'SAT';
	}
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function displaySpinner() {
	var opts = {
		lines: 11, // The number of lines to draw
		length: 15, // The length of each line
		width: 9, // The line thickness
		radius: 28,// The radius of the inner circle
		corners: 0.9, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 50, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};
	var target = document.getElementById('spinner');
	spinner = new Spinner(opts).spin(target);
};

function hideSpinner() {
	if(spinner) {
		spinner.stop()
		spinner = null;	
	}
	
};