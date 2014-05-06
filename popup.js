
/**
 * Copyright (C) <2013> <Alcatel-Lucent Enterprise>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * 
 * Version 0.9
 * - Merge the two extensions into a single one for listing, scheduling and modifying meetings
 * - Do not use 'logoff' and 'removeCookies' because it deconnects OTC/Web from its session
 * ...
 * 
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

var meetingsList = null;

var editExistingMeeting = null;

/**
 * Initialize
 */
function init() {

	console.log("--init");

	var btn = document.querySelector("#scheduleBtn");
	var startDate = document.querySelector('.dateInput');
	var endDate = document.querySelector('.endDateInput');
	var recurrence = document.querySelector('.recurrenceType');
	var confTypeElt = document.querySelector(".conferenceType");
	var confPassword = document.querySelector('.passwordCheck');
	
	var closeButton = document.querySelector('#closeButton');
	
	var closeLoginButton = document.querySelector('#closeLoginButton');
	var settingBtn = document.querySelector('#settingBtn');

	var editor = document.querySelector('#editor');

	var meetings = document.querySelector('#list');
	var createBtn = document.querySelector('#createBtn');

	var cancelBtn = document.querySelector('#cancelBtn');

	btn.onclick = function(event){
		event.preventDefault();
		event.stopPropagation();

		schedule();
	};

	startDate.onchange = function() {
		var date = startDate.value;
		var end = endDate.value;
		if (moment(date).isBefore(moment(startMeeting))) {
			startDate.value = startMeeting.toJSON().substring(0,10);
		}
		if(moment(end).isBefore(moment(date))) {
			endDate.value = new Date(date).toJSON().substring(0,10);
		}
	};
	
	endDate.onchange = function() {
		var date = endDate.value;
		var start = startDate.value;
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
	
	checkLoginButton = function() {
		if(loginField.value.length && passwordField.value.length && otField.value.length) {
			loginButton.disabled = false;
		}
		else {
			loginButton.disabled = true;
		}
	};
	
	closeButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		var error= document.querySelector('#errorModal');
		error.classList.remove('visible');

		var editor= document.querySelector('.editor');
		editor.classList.remove('blur');
	};

	createBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		displayEditor();
	};

	cancelBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		editExistingMeeting = null;
		hideMeetingEditor();
	};

	closeLoginButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		var loginError= document.querySelector('#errorLogin');
		loginError.classList.add('masked');
		loginError.classList.remove('visible');

		var list= document.querySelector('#list');
		list.classList.remove('blur');
	};

	settingBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		displayConfig(onLoad, this);

	};

	document.querySelector(".dateInput").value = startMeeting.toJSON().substring(0,10);
	/* __FIX__ Use toLocaleTimeString() instead of toJSONString() to avoid issue with GMT+xxx */
	document.querySelector(".startTimeInput").value = startMeeting.toLocaleTimeString().substr(0, 5);

	document.querySelector(".endDateInput").value = startMeeting.toJSON().substring(0,10);

};

function displayEditor(meeting) {

	console.log("meeting", meeting);

	var editor = document.querySelector('#editor');
	var meetings = document.querySelector('#list');

	meetings.classList.remove('displayed');
	meetings.classList.add('masked');
	editor.classList.remove('masked');
	editor.classList.add('displayed');

	if(meeting) {

		editExistingMeeting = meeting.vanity;

		document.querySelector(".titleInput").value = meeting.title;
		document.querySelector(".dateInput").value = meeting.start;
		document.querySelector(".endDateInput").value = meeting.end;
		document.querySelector('.conferenceType').value = meeting.type;
		confType = meeting.type;
		recurrenceValue = meeting.recurrence;

		if(meeting.type === 'reservationless') {
			document.querySelector('.recurrenceType').disabled = true;
			document.querySelector(".endDateInput").disabled = false;
			document.querySelector('.startTimeInput').value = "00:00";
			document.querySelector('.startTimeInput').disabled = true;
			document.querySelector('.durationInput').value = 1;
			document.querySelector('.durationInput').disabled = true;
		}
		else {
			document.querySelector('.recurrenceType').disabled = false;
			document.querySelector('.recurrenceType').value = meeting.recurrence;
			document.querySelector('.startTimeInput').value = meeting.hour + ':' + meeting.minute;
			document.querySelector('.startTimeInput').disabled = false;
			document.querySelector('.durationInput').value = meeting.duration;
			document.querySelector('.durationInput').disabled = false;
		}

		if(meeting.password) {
			document.querySelector('.passwordCheck').checked = true;
			document.querySelector('.passwordInput').value = meeting.password;
			document.querySelector('.passwordInput').disabled = false;
		}
		else {
			document.querySelector('.passwordCheck').checked = false;
			document.querySelector('.passwordInput').disabled = true;
		}

	}
};


function hideMeetingEditor() {
	var editor = document.querySelector('#editor');
	var meetings = document.querySelector('#list');

	editor.classList.remove('displayed');
	editor.classList.add('masked');
	meetings.classList.add('displayed');
	meetings.classList.remove('masked');
};

function updateGUI() {
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



/* ------------------------------------- Ajax request ----------------------------------------------- */



/* ----------------------------------------- ACS functions used --------------------------------------- */

/**
 * Schedue a conference
 */
function schedule() {

	console.log("--schedule");

	var conf_title = document.querySelector(".titleInput").value;
	var conf_date = document.querySelector(".dateInput").value;
	var conf_time = document.querySelector(".startTimeInput").value;
	var conf_duration = document.querySelector(".durationInput").value;

	var timestamp = Date.parse(conf_date + " " + conf_time);
	var date_start = new Date(timestamp);

	var end = document.querySelector(".endDateInput").value;
	timestamp = Date.parse(end + " " + "23:59");
	date_end = new Date(timestamp);

	var hasPassword = document.querySelector(".passwordCheck").checked;

	var password = document.querySelector('.passwordInput').value;

	if(!hasPassword) {
		password = null;
	}

	var meeting = {
		type: confType,
		title: conf_title,
		timezone: timezone,
		start: date_start,
		end: date_end,
		duration: conf_duration,
		recurrence: recurrenceValue,
		password: password,
		modify : editExistingMeeting
	};

	scheduleMeeting(meeting).then(function(jsonResponse) {
		displayResult(jsonResponse, editExistingMeeting);
	}, function() {

	});

};

function hideEmptyArea() {
	var empty = document.querySelector('#empty');
	empty.classList.add('masked');
};

function showEmptyArea() {
	var empty = document.querySelector('#empty');
	empty.classList.remove('masked');
};


/**
 * Display result of scheduled conference
 */
function displayResult(response, isModified) {

	console.log("--displayResult", response);

	var xml = response.data;

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

			if(isModified) {
				document.querySelector('.firstLine').innerHTML = 'Your meeting has been successfully modified !';
			}
			else {
				document.querySelector('.firstLine').innerHTML = 'Here are the access code for this meeting';

				// Search for "url", first one leader, second participant, behind the /call/
				var callVanityLeader = xml.getElementsByTagName("url")[0].childNodes[0].textContent.slice(6);
				var callVanityParticipant = xml.getElementsByTagName("url")[1].childNodes[0].textContent.slice(6);

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
			}

			var ok = document.querySelector('#okModal').classList.add('visible');
			var editor = document.querySelector('#editor').classList.add('blur');
			var clearButton = document.querySelector('#clearButton');
			clearButton.onclick = function(event) {
				event.preventDefault();
				event.stopPropagation();
				var ok= document.querySelector('#okModal').classList.remove('visible');
				var editor= document.querySelector('#editor');
				editor.classList.remove('blur');
				hideMeetingEditor();
				displaySpinner();
				// Get the list of Meetings
				return(getListofMeetings())
				.then(function(jsonResponse) {
					// Display meetings
					displayMeetings(jsonResponse);
					// Hide Spinner
					hideSpinner();
				}, function() {

				});
				clearButton.onclick = null;
				clearButton = null;
			};

			
		}

	}
	else {
		console.log("Conference can\'t be scheduled. Check your parameters and try again!");
	}
}

function displayMeetings(response) {

	var xml = response.data;

	if(xml) {
		var conference = xml.getElementsByTagName("conference");

		// Initialize or delete all conferences displayed in list
		var list = document.querySelector("#meetings");
		list.innerHTML = "";
		meetingsList = {};

		var len = conference.length;
		if(len > 0) {
			for(var i=0, len=conference.length;i<len;i++) {
				displayMeeting(conference[i]);
			}	
		}
		else {
			showEmptyArea();		
		}
	}

};

function displayMeeting(xml) {

	var list = document.querySelector("#meetings");

	console.log(xml);

	var typeConf = xml.getAttribute("type");

	var subject = "Unnamed";
	if(xml.getElementsByTagName("subject")[0]) {
		subject = xml.getElementsByTagName("subject")[0].childNodes[0].nodeValue;
	}
	var from = xml.getElementsByTagName("owner")[0].childNodes[0].nodeValue;
	var name = from.substr(0, from.indexOf('@'));
	var company = from.substring(from.indexOf('@') + 1);
	var day = xml.getElementsByTagName('time')[0].getElementsByTagName('day')[0].textContent;
	var month = xml.getElementsByTagName('time')[0].getElementsByTagName('month')[0].textContent;
	var year = xml.getElementsByTagName('time')[0].getElementsByTagName('year')[0].textContent;
	var day_end = xml.getElementsByTagName('time')[1].getElementsByTagName('day')[0].textContent;
	var month_end = xml.getElementsByTagName('time')[1].getElementsByTagName('month')[0].textContent;
	var year_end = xml.getElementsByTagName('time')[1].getElementsByTagName('year')[0].textContent;

	var duration = 0;
	var hasRecurrence = false;

	var recurrenceType = "";
	if(xml.getElementsByTagName("recurrence").length > 0) {
		hasRecurrence = true;
		recurrenceType = xml.getElementsByTagName("recurrence")[0].getAttribute('type');
		var pattern = xml.getElementsByTagName("recurrence")[0].getAttribute('pattern');
		if(pattern === 'D-WE') {
			recurrenceType = 'daily';
		}
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

	var duration = parseInt(hour_end) - parseInt(hour);

	var timezone = xml.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;
	var vanity = xml.getElementsByTagName("vanity")[0].childNodes[0].nodeValue;

	var state = xml.getElementsByTagName("access")[1].getAttribute("state");
	var stateDisplayed = capitaliseFirstLetter(state);

	if(parseInt(month) < 10) {
		month = '0' + month;
	}

	if(parseInt(day) < 10) {
		day = '0' + day;
	}

	var startDate = moment(year + '-' + month + '-' + day, "YYYY-MM-DD");
	var meetingStartDate = startDate.format('YYYY-MM-DD');
	startDate.add(parseInt(hour), 'h').add(parseInt(minute), 'm');

	var endDate = moment(year_end + '-' + month_end + '-' + day_end);
	var meetingEndDate = endDate.format('YYYY-MM-DD');
	
	var startDateString = startDate.format("dddd, MMMM Do");
	var startDateStringNext = "";
	if(hasRecurrence) {
		switch (recurrenceType) {
			case "weekly":
				startDateString = "Each " + startDate.format("dddd");
				startDateStringNext = startDate.format("MMMM Do") + " to " + endDate.format("MMMM Do");
				break;
			case "daily":
				startDateString = "Every week day";
				startDateStringNext = startDate.format("MMMM Do") + " to " + endDate.format("MMMM Do");
				break;
		}
	}
	
	var item = document.createElement("li");
	item.className =  "buddies-item";
	item.innerHTML += '<div class=" meeting-state meeting-' + state + '" />';
	item.innerHTML += '<span class="meetingTitle">' + subject + '</span>';

	var documents = xml.getElementsByTagName('document');
	if (documents && documents.length > 0) {
		if(documents.length === 1) {
			stateDisplayed += ' - with 1 file';
		} else {
			stateDisplayed += ' - ' + documents.length + ' files';
		}
	}

	item.innerHTML += '<span class="meetingState">' + stateDisplayed + '</span>';
	item.innerHTML += '<span class="meetingStartDate">'+ startDateString + '</span>';
	item.innerHTML += '<span class="meetingStartDateNext">'+ startDateStringNext + '</span>';

	if(typeConf == "scheduled") {

		var startTimeString = startDate.format('HH:mm');
		var endTimeString = hour_end + ":" + minute_end;

		if(hasRecurrence) {
			duration = parseInt(xml.getElementsByTagName('recurrence')[0].getElementsByTagName('duration')[0].textContent) / 3600 ;
		
			var m = startDate.clone();
			m.add(duration, 'h');
			endTimeString = m.format('HH:mm');
		} 

		item.innerHTML += '<span class="meetingTime">' + startTimeString + " - " + endTimeString + '</span>';
		item.innerHTML += '<span class="meetingTimezone">' + timezone + '</span>';
	}
	else {
		item.innerHTML += '<span class="meetingTime">' + endDate.format("ddd, MMMM Do") + '</span>';
		
		var now = moment();
		var days = -1;

		if(now.isAfter(startDate)) {
			if(now.isAfter(endDate)) {
				days = -1;
			}
			else {
				days = endDate.utc().diff(now.utc(), 'days');
			}
		}
		else {
			days = endDate.utc().diff(startDate.utc(), 'days');
		}
		
		if(days > 30) {
			item.innerHTML += '<span class="meetingTimezone">' + "> 1 month left" + '</span>';
		}
		else {
			if(days > 1) {
				item.innerHTML += '<span class="meetingTimezone">' + days + " days left" + '</span>';
			}
			else {
				if(days == 1) {
					item.innerHTML += '<span class="meetingTimezone">' + days + " day left" + '</span>';
				}
				else {
					item.innerHTML += '<span class="meetingTimezone">' + "Expires today" + '</span>';
				}
			}
		}
	}
	
	var removeID = "remove-" + vanity;
	var editID = "edit-" + vanity;
	var detailsID = "details-" + vanity;

	item.innerHTML += '<button type="action" id="' + detailsID + '" class="meetingActionButton meetingDetailsButton">Details</button>';
	item.innerHTML += '<button type="action" id="' + editID + '" class="meetingActionButton meetingEditButton">Edit</button>';
	item.innerHTML += '<button type="action" id="' + removeID + '" class="meetingActionButton meetingRemoveButton">Remove</button>';

	var callVanityLeader = xml.getElementsByTagName("access")[1].childNodes[1].textContent;
	var callVanityParticipant = xml.getElementsByTagName("access")[2].childNodes[1].textContent;

	var path = xml.getElementsByTagName("join_url_root")[0].textContent;

	var password = '';

	if(xml.getElementsByTagName("documents")[0].getElementsByTagName('password') && xml.getElementsByTagName("documents")[0].getElementsByTagName('password')[0]) {
		password = xml.getElementsByTagName("documents")[0].getElementsByTagName('password')[0].textContent;
	}



	var meeting = {
		vanity: vanity,
		title: subject,
		type: typeConf,
		recurrence: recurrenceType || 'none',
		start: meetingStartDate,
		end: meetingEndDate,
		hour: hour,
		minute: minute,
		duration: duration,
		password: password
	};
	
	item.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		var answer = confirm("Join the conference '" + subject + "' ?");
		if(answer) {
			join(vanity);
		}
	});

	list.appendChild(item);

	var leaderURL= "https://" + host_param + path + callVanityLeader;
	var participantURL= "https://" + host_param + path + callVanityParticipant;

	var remove = document.querySelector("#" + removeID);
	remove.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		var answer = confirm("Are you sure you want to remove this Meeting '" + subject + "' ?");
		if(answer) {
			displaySpinner();
			deleteMeeting(host_param, vanity).then(function(jsonResponse) {
				// Display meetings
				displayMeetings(jsonResponse);
				// Hide Spinner
				hideSpinner();
			}, function() {

			});
		}
	});

	var edit = document.querySelector("#" + editID);
	edit.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		// Edit existing meeting
		displayEditor(meeting);

	});

	var details = document.querySelector("#" + detailsID);
	details.addEventListener("click", function(event) {
		event.preventDefault();
		event.stopPropagation();
		document.querySelector('#okModal').classList.add('visible');
		document.querySelector('#list').classList.add('blur');
		var clearButton = document.querySelector('#clearButton');

		// Update leader information
		document.querySelector('.leader').innerHTML = 'Leader code = ' + callVanityLeader;
		
		var a=document.createElement("a");
		a.href = leaderURL;
		a.innerHTML = leaderURL;
		a.onclick = function() {
			window.open(leaderURL,"_blank"); 
		}

		var leaderNode = document.querySelector('.leaderURL');
		while (leaderNode.firstChild) {
			leaderNode.removeChild(leaderNode.firstChild);
		}

		leaderNode.appendChild( a );
		
		// Update Participant information
		document.querySelector('.participant').innerHTML = 'Participant code = ' + callVanityParticipant;
		
		var b=document.createElement("a");
		b.href = participantURL;
		b.innerHTML = participantURL;
		b.onclick = function() {
			window.open(participantURL,"_blank"); 
		}

		var participantNode = document.querySelector('.participantURL');
		while (participantNode.firstChild) {
			participantNode.removeChild(participantNode.firstChild);
		}
		participantNode.appendChild( b );

		clearButton.onclick = function(event) {
			event.preventDefault();
			event.stopPropagation();
			document.querySelector('#okModal').classList.remove('visible');
			document.querySelector('#list').classList.remove('blur');
			clearButton.onclick = null;
			clearButton = null;
		};
	});
	
};


/* ----------------------------------------- ON LOAD ---------------------------------------------- */

/**
 * When page is loaded, start the extension
 */
document.addEventListener('DOMContentLoaded', function () {
	if(!loaded) {
		onInitialize();
		loaded = true;
	}
});

document.addEventListener("unload", function (event) {
   logoff();
}, true);

function onInitialize() {
	// Initialize the extension
  	init();
  	// Load the extension
  	onLoad();
} 

function onLoad() {
	//Signout from previous session
	erasePreviousUserData();
};

function erasePreviousUserData() {

	if(host_param && login_param && password_param) {

		// Logoff from previous session if exits
		//logoff()
		//.then(function() {
			// Delete previous used cookies if exist
			//return(deletePreviouslyUsedCookies())
			//.then(function() {
				// Login
				login(host_param, login_param, password_param)
				.then(function() {
					// Get the global settings (Timezone)
					return(getGlobalSettings())
					.then(function(jsonResponse) {
						var settings = jsonResponse.data;
						timezone = settings.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;
						console.log("Timezone:", timezone);
						// Remove default no result view
						hideEmptyArea();
						// Display Spinner
						displaySpinner();
						// Get the list of Meetings
						return(getListofMeetings())
						.then(function(jsonResponse) {
							// Display meetings
							displayMeetings(jsonResponse);
							// Hide Spinner
							hideSpinner();
							// Enable create new meeting button
							enableCreateNewMeetingButton();
						}, function() {
							displayErrorLogin();
							// Hide Spinner
							hideSpinner();
							// Remove default no result view
							showEmptyArea();
						});
					}, function() {
						displayErrorLogin();
					});
				}, function() {
					displayErrorLogin();
				});
			//}, function() {
			//})
		//}, function() {
			//displayErrorLogin();
		//});
	}
	else {
		displayErrorLogin();
	}
};

function enableCreateNewMeetingButton() {
	createBtn.disabled = false;
};

function disableCreateNewMeetingButton() {
	createBtn.disabled = true;
};

function displayErrorLogin() {
	setTimeout(function() {

		disableCreateNewMeetingButton();

		var loginError= document.querySelector('#errorLogin');
		loginError.classList.remove('masked');
		loginError.classList.add('visible');

		var list= document.querySelector('#list');
		list.classList.add('blur');
	}, 500);
};

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