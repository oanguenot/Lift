
/**
 * Copyright (C) <2013> <Alcatel-Lucent Enterprise>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Version 1.0.4:
 * Use File API instead of localstorage for storing the Login/Password
 * Fix issue "expires today" label that is still displayed when meeting is eneded
 *
 * Version 1.0.3:
 * Use OTC clients graphical chart (font still roboto instead of clanOT)
 *
 * Version 1.0.2:
 * Fix issue (replace HTTP protocol with HTTPS for the URL)
 * 
 * Version 1.0 & 1.0.1:
 * - First released version on the Chrome Store
 * - Fix issue when re-scheduling a meeting (to have a new empty form without previous info)
 * - Add placeholder icon
 *
 * Version 0.9:
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


var login_param = "";       //localStorage["lift_login"]"";
var password_param = "";    //localStorage["lift_password"];
var host_param = "";        //localStorage["lift_host"];        

var timezone = "Europe/Paris";
var confType = "scheduled";
var recurrenceValue = 'none';

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
    };
    
    confTypeElt.onchange = function() {
        confType = confTypeElt.value;
        updateGUI();
    };
    
    confPassword.onchange = function() {
        document.querySelector('.passwordInput').disabled = !event.target.checked;
        if(!event.target.checked) {
            document.querySelector('.passwordInput').value = '';
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

}

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
            if(recurrenceValue !== 'none') {
                document.querySelector(".endDateInput").disabled = false;
            }
            else {
                document.querySelector(".endDateInput").disabled = true;
            }
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
    else {

        editExistingMeeting = null;

        document.querySelector(".titleInput").value = "New Meeting";
        document.querySelector('.conferenceType').value = "scheduled";

        document.querySelector(".dateInput").value = startMeeting.toJSON().substring(0,10);
        
        document.querySelector(".startTimeInput").value = startMeeting.toLocaleTimeString().substr(0, 5);
        document.querySelector(".startTimeInput").disabled =false;

        document.querySelector(".endDateInput").disabled = true;
        document.querySelector(".endDateInput").value = startMeeting.toJSON().substring(0,10);
        
        document.querySelector('.durationInput').disabled = false;
        document.querySelector('.durationInput').value = 1;
        
        document.querySelector('.recurrenceType').disabled = false;
        document.querySelector('.recurrenceType').value = 'none';

        document.querySelector('.passwordCheck').checked = false;
        document.querySelector('.passwordInput').disabled = true;
        document.querySelector('.passwordInput').value = "";
    }
}


function hideMeetingEditor() {
    var editor = document.querySelector('#editor');
    var meetings = document.querySelector('#list');

    editor.classList.remove('displayed');
    editor.classList.add('masked');
    meetings.classList.add('displayed');
    meetings.classList.remove('masked');
}

function updateGUI() {
    if(confType === "scheduled") {
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
    var date_end = new Date(timestamp);

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
}

function hideEmptyArea() {
    var empty = document.querySelector('#empty');
    empty.classList.add('masked');
}

function showEmptyArea() {
    var empty = document.querySelector('#empty');
    empty.classList.remove('masked');
}

function clearMeetingsList() {
    // Initialize or delete all conferences displayed in list
    var list = document.querySelector("#meetings");
    list.innerHTML = "";
    meetingsList = {};
}


/**
 * Display result of scheduled conference
 */
function displayResult(response, isModified) {

    console.log("--displayResult", response);

    var xml = response.data;

    if(xml) {

        var code = xml.getElementsByTagName("message")[0].getAttribute("type");
        if(code === "error") {
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

                var urlLeader = "https://" + xml.getElementsByTagName("domain")[0].childNodes[0].nodeValue + 
                            xml.getElementsByTagName("join_url_root")[0].childNodes[0].nodeValue + 
                            callVanityLeader;

                var urlParticipant = "https://" + xml.getElementsByTagName("domain")[0].childNodes[0].nodeValue + 
                            xml.getElementsByTagName("join_url_root")[0].childNodes[0].nodeValue + 
                            callVanityParticipant;

                // Update leader information
                document.querySelector('.leader').innerHTML = 'Leader code = ' + callVanityLeader;
                
                var a=document.createElement("a");
                a.href = urlLeader;
                a.innerHTML = urlLeader;
                a.onclick = function() {
                    window.open(urlLeader,"_blank"); 
                };

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
                };

                var participantNode = document.querySelector('.participantURL');
                while (participantNode.firstChild) {
                    participantNode.removeChild(participantNode.firstChild);
                }
                participantNode.appendChild( b );
            }

            document.querySelector('#okModal').classList.add('visible');
            document.querySelector('#editor').classList.add('blur');
            var clearButton = document.querySelector('#clearButton');
            clearButton.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                document.querySelector('#okModal').classList.remove('visible');
                document.querySelector('#editor').classList.remove('blur');
                hideMeetingEditor();
                displaySpinner();
                // Get the list of Meetings
                getListofMeetings()
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
        clearMeetingsList();

        var len = conference.length;
        if(len > 0) {

            hideEmptyArea();

            for(var i=0; i<len; i++) {
                displayMeeting(conference[i]);
            }   
        }
        else {
            showEmptyArea();        
        }
    }

}

function displayMeeting(xml) {

    var list = document.querySelector("#meetings");

    console.log(xml);

    var typeConf = xml.getAttribute("type");

    var subject = "Unnamed";
    if(xml.getElementsByTagName("subject")[0]) {
        subject = xml.getElementsByTagName("subject")[0].childNodes[0].nodeValue;
    }
    
    //var from = xml.getElementsByTagName("owner")[0].childNodes[0].nodeValue;
    //var name = from.substr(0, from.indexOf('@'));
    //var company = from.substring(from.indexOf('@') + 1);
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
    if(parseInt(hour, 10) === 0)  {
        hour = "00";
    } else if (parseInt(hour, 10) < 10) {
        hour = "0" + hour;
    }
    
    var minute = xml.getElementsByTagName("minute")[0].childNodes[0].nodeValue;
    if(parseInt(minute, 10) === 0) {
        minute = "00";
    } else if (parseInt(minute, 10) < 10) {
        minute = "0" + minute;
    }

    var hour_end = xml.getElementsByTagName("hour")[1].childNodes[0].nodeValue;
    if(parseInt(hour_end, 10) === 0) {
        hour_end = "00";
    } else if(parseInt(hour_end, 10) < 10) {
        hour_end = "0" + hour_end;
    }
    
    var minute_end = xml.getElementsByTagName("minute")[1].childNodes[0].nodeValue;
    if(parseInt(minute_end, 10) === 0) {
        minute_end = "00";
    } else if(parseInt(minute_end, 10) < 10) {
        minute_end = "0" + minute_end;
    }

    duration = parseInt(hour_end, 10) - parseInt(hour, 10);

    var timezone = xml.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;
    var vanity = xml.getElementsByTagName("vanity")[0].childNodes[0].nodeValue;

    var state = xml.getElementsByTagName("access")[1].getAttribute("state");
    var stateDisplayed = capitaliseFirstLetter(state);

    if(parseInt(month, 10) < 10) {
        month = '0' + month;
    }

    if(parseInt(day, 10) < 10) {
        day = '0' + day;
    }

    var startDate = moment(year + '-' + month + '-' + day, "YYYY-MM-DD");
    var meetingStartDate = startDate.format('YYYY-MM-DD');
    startDate.add(parseInt(hour, 10), 'h').add(parseInt(minute, 10), 'm');

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
                startDateString = "Each week day";
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

    if(typeConf === "scheduled") {

        var startTimeString = startDate.format('HH:mm');
        var endTimeString = hour_end + ":" + minute_end;

        if(hasRecurrence) {
            duration = parseInt(xml.getElementsByTagName('recurrence')[0].getElementsByTagName('duration')[0].textContent, 10) / 3600 ;
        
            var m = startDate.clone();
            m.add(duration, 'h');
            endTimeString = m.format('HH:mm');
        } 

        item.innerHTML += '<span class="meetingTime">' + startTimeString + " - " + endTimeString + '</span>';
        item.innerHTML += '<span class="meetingTimezone">' + timezone + '</span>';
    }
    else {

        startDateString = "Each day";
        startDateStringNext = startDate.format("MMMM Do") + " to " + endDate.format("MMMM Do");

        item.innerHTML += '<span class="meetingTime">Whole day</span>';
        
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
        
        if (days > 30) {
            item.innerHTML += '<span class="meetingTimezone">' + "> 1 month left" + '</span>';
        }
        else if (days > 1) {
            item.innerHTML += '<span class="meetingTimezone">' + days + " days left" + '</span>';
        }
        else if (days === 1) {
            item.innerHTML += '<span class="meetingTimezone">' + days + " day left" + '</span>';
        }
        else if (days === 0) {
            item.innerHTML += '<span class="meetingTimezone">' + "Expires today" + '</span>';
        }
        else {
            item.innerHTML += '<span class="meetingTimezone">' + "" + '</span>';
        }
    }

    item.innerHTML += '<span class="meetingStartDate">'+ startDateString + '</span>';
    item.innerHTML += '<span class="meetingStartDateNext">'+ startDateStringNext + '</span>';
    
    var removeID = "remove-" + vanity;
    var editID = "edit-" + vanity;
    var detailsID = "details-" + vanity;
    var shareID = "share-" + vanity;

    item.innerHTML += '<button type="action" id="' + detailsID + '" class="meetingActionButton meetingDetailsButton">Details</button>';
    item.innerHTML += '<button type="action" id="' + shareID + '" class="meetingActionButton meetingShareButton">Share</button>';
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

    var share = document.querySelector('#' + shareID);
    share.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        shareMeeting(meeting);
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
        };

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
        };

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
    
}

function join(vanity) {
    window.open("https://" + host_param + "/call/" + vanity,"_blank");
}

function shareMeeting(meeting) {
    var cal = ics();

    if(meeting.type === 'scheduled') {
        console.log("meeting", meeting.start);
    }

    cal.addEvent(meeting.title, "You have been invited to the following meeting", "", meeting.start, meeting.end);
    cal.download("meeting");
}


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

function onInitialize() {
    // Initialize the extension
    init();
    // Load the extension
    onLoad();
}

function onLoad() {
    console.log("coucou");
    //Signout from previous session
    erasePreviousUserData();
}

function erasePreviousUserData() {

    showEmptyArea();

    //Read data from file
    loadDataFromFile().then(function(data) {
        console.log("data", data);
        host_param = data.host;
        login_param = data.login;
        password_param = data.password;

        if(host_param && host_param.length > 0 &&
            login_param && login_param.length > 0 &&
            password_param && password_param.length > 0) {

            // Remove default no result view
            hideEmptyArea();
            // Display Spinner
            displaySpinner();

            login(host_param, login_param, password_param)
            .then(function() {
                // Get the global settings (Timezone)
                return(getGlobalSettings())
                .then(function(jsonResponse) {
                    var settings = jsonResponse.data;
                    timezone = settings.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;
                    
                    // Get the list of Meetings
                    return(getListofMeetings())
                    .then(function(jsonResponse) {
                        // Display meetings
                        displayMeetings(jsonResponse);
                        // Enable create new meeting button
                        enableCreateNewMeetingButton();
                        // Hide Spinner
                        hideSpinner();
                    }, function() {
                        displayErrorLogin();
                        
                    });
                }, function() {
                    displayErrorLogin();
                });
            }, function() {
                displayErrorLogin();
            });
        }
        else {
            displayErrorLogin();
        }

    }, function() {
        displayErrorLogin();
    });
}

function enableCreateNewMeetingButton() {
    document.querySelector('#createBtn').disabled = false;
}

function disableCreateNewMeetingButton() {
    document.querySelector('#createBtn').disabled = true;
}

function displayErrorLogin() {
    setTimeout(function() {

        // Hide Spinner
        hideSpinner();

        // Remove default no result view
        showEmptyArea();

        // Disable create button
        disableCreateNewMeetingButton();

        var loginError= document.querySelector('#errorLogin');
        loginError.classList.remove('masked');
        loginError.classList.add('visible');

        var list= document.querySelector('#list');
        list.classList.add('blur');
    }, 300);
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
}

function hideSpinner() {
    if(spinner) {
        spinner.stop();
        spinner = null; 
    }
    
}