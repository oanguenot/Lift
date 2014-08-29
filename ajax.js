/**
 * Manage request thru the ACS
 * Use Promise to deal with asynchrounous call
 */

var socket = null;

var contacts = {};


/**
 * Send an ajax request to ACS
 * Using promise
 * @param {String} req The request URL
 * @private
 */

function _request(req) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {

        req += "&_nocachex=" + Math.floor(Math.random()*2147483647);

        log_debug("AJAX", "Send", req);

        var http = new XMLHttpRequest();

        var parts = req.split('?');

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
                    log_error("AJAX", "Receive", http);
                    reject([null]);
                }
            } else {

            }
        };

        http.send(parts[1]);

    });
}

/**
 * Log off the logged in user from ACS
 */
/*
function logoff() {

    return new Promise(function(resolve, reject) {

        console.log("--logoff");

        // Logout previous user - if any
        var url = "http://" + host_param + "/ics?action=signout";

        _request(url).then(function() {

            console.log("--logOff Successfull");
            resolve();
        }, function(err) {
            console.log("--logOff Error", err);
            reject();
        });

        resolve();

    });
}
*/

/**
 * Log in to ACS
 * @param {String} hostname The OT server hostname
 * @param {String} username The user name
 * @param {String} password The user password
 */

function login(hostname, username, password) {

    return new Promise(function(resolve, reject) {
    
        log_debug("AJAX", "Login with", username, hostname);

        //Login with user data
        var url = "http://" + host_param +"/ics?action=signin&userid=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&remember_password=false&display=none";

        _request(url).then(function(jsonResponse) {
            if(jsonResponse && jsonResponse.data !== null) {
                
                log_warning("AJAX", "Login not good");
                reject();
            }
            else {
                log_info("AJAX", "Login successfull");
                resolve();
            }
            
        }, function(err) {
            log_error("AJAX", "Login", err);
            reject();
        });

    });
}

/**
 * Get global setting from the server
 * Used to get the timezone parameter
 */

function getGlobalSettings() {

    return new Promise(function(resolve, reject) {

        log_info("AJAX", "Get global server settings");

        /* __FIX__ Get the timezone */
        var url = "http://" + host_param + "/cgi-bin/vcs?settings=global;phone;password&show_timezones=true";

        _request(url).then(function(jsonResponse) {

            log_debug("AJAX", "Received", jsonResponse);
            resolve(jsonResponse);
        }, function(err) {
            log_error("AJAX", "getGlobalSettings", err);
            reject();
        });
    });
}

function getListofMeetings() {

    return new Promise(function(resolve, reject) {

        log_info("AJAX", "Get the list of meetings");

        var url = "http://" + host_param + "/cgi-bin/vcs?all_vanities=true&hide_temp_confs=true&show_conf_passwords=true&call_data=true";

        _request(url).then(function(jsonResponse) {
            log_debug("AJAX", "Received", jsonResponse);
            resolve(jsonResponse);
        }, function(err) {
            log_error("AJAX", "getListofMeetings", err);
            reject();
        });

    });
}

function getMeetingInfo(vanity) {

    return new Promise(function(resolve, reject) {

        log_info("AJAX", "Get meeting information", vanity);

        var url = "http://" + host_param + "/cgi-bin/vcs?vanity=" + vanity;

        _request(url).then(function(jsonResponse) {
            log_debug("AJAX", "Received", jsonResponse);

            var xml = jsonResponse.data;

            var state = 'unknown';
            if(xml.getElementsByTagName("access") && xml.getElementsByTagName("access").length > 0) {
                
                var states = xml.getElementsByTagName("access");
                for(var i = 0; i< states.length; i++) {
                    state = states[i].getAttribute("state");
                }
                
                if(state.length === 0) {
                    state = 'unknown';
                }
            }
            resolve(state);
        }, function(err) {
            log_error("AJAX", "getMeetingInfo", err);
            reject();
        });

    });
}

function scheduleMeeting(params) {

    return new Promise(function(resolve, reject) {

        log_debug("AJAX", "Schedule a new meeting", params);

        var day = _getDay(moment(params.start).day() + 1);

        var url = "http://" + host_param + 
        "/cgi-bin/vcs_conf_schedule?" + 
        "conf_type=" + params.type + 
        "&no_audio=false" + 
        "&calling_disabled=false" + 
        "&timezone=" + params.timezone +  
        "&start_year=" + params.start.getFullYear() + 
        "&start_month=" + (params.start.getMonth()+1) +
        "&start_day=" + params.start.getDate();

        if(params.modify) {
            url += "&mod_vanity=" + params.modify;
        }
    
        if(params.type === "scheduled") {
            url += "&start_hour=" + params.start.getHours() +
            "&start_min=" + params.start.getMinutes() +
            "&start_sec=" + params.start.getSeconds() +
            "&duration_hours=" + params.duration;

            switch (params.recurrence) {
                case 'none':
                    url += "&num_occurrences=1";
                break;
                case 'daily':
                    url += "&recurrence=D-WE" +
                    "&end_year=" + params.end.getFullYear() +  
                    "&end_month=" + (params.end.getMonth()+1) +
                    "&end_day=" + params.end.getDate() +
                    "&end_hour=" + params.end.getHours() +
                    "&end_min=" + params.end.getMinutes() +
                    "&end_sec=" + params.end.getSeconds(); 
                break;
                case 'weekly':
                    url += "&recurrence=W-1-" + day +
                    "&end_year=" + params.end.getFullYear() +  
                    "&end_month=" + (params.end.getMonth()+1) +
                    "&end_day=" + params.end.getDate() +
                    "&end_hour=" + params.end.getHours() +
                    "&end_min=" + params.end.getMinutes() +
                    "&end_sec=" + params.end.getSeconds(); 
                break;
            }
        }
        else {
            url += "&start_hour=0" +
            "&start_min=0" +
            "&start_sec=0" +
            "&end_year=" + params.end.getFullYear() +  
            "&end_month=" + (params.end.getMonth()+1) +
            "&end_day=" + params.end.getDate() +
            "&end_hour=" + params.end.getHours() +
            "&end_min=" + params.end.getMinutes() +
            "&end_sec=" + params.end.getSeconds(); 
        }

        url += "&subject=" + params.title;

        if(params.password) {
            url += "&web_password=" + params.password;
            url += "&audio_password=" + params.password;
        }

        switch(params.profile) {
            case 'meeting':
                url +='&create_callback=true'; 
                url +='&video_allowed=true';
                url +='&announce_callers=true';
                url +='&record_callers=true';
                url +='&continuous_chat=true';
                url +='&disable_join_tones=false';
                break;
            case 'webinar':
                url +='&webinar_mode=true';     // Use this flag to test webinar mode
                url +='&drop_with_leader=true';
                url +='&lecture_mode=true';
                url +='&leader_req=true';
                url +='&disable_participant_mute=true';
                url +='&disable_join_tones=true';
                url +='&continuous_chat=true';
                url +='&suppress_system_im=true';
                break;
            case 'training':
                url +='&video_allowed=true';
                url +='&announce_callers=true';
                url +='&announce_callers_on_exit=true';
                url +='&drop_with_leader=true';
                url +='&lecture_mode=true';
                url +='&disable_join_tones=true';
                url +='&record_callers=true';
                url +='&continuous_chat=true';
                url +='&owner_starts_presentation=true';    // Use this flag to test training mode
                url +='&suppress_system_im=true';
                break;
            case 'call':
                url +='&create_callback=true'; 
                url +='&announce_callers=true';
                url +='&announce_callers_on_exit=true';
                url +='&drop_with_leader=true';
                url +='&disable_join_tones=true';
                url +='&record_callers=true';
                url +='&audio_only=true';   // Use this flag to test call only
                url +='&continuous_chat=true';
                url +='&suppress_system_im=true';
                break;
        }

        _request(url).then(function(jsonResponse) {
            log_debug("AJAX", "Received", jsonResponse);
            resolve(jsonResponse);
        }, function(err) {
            log_error("AJAX", "scheduleMeeting", err);
            reject();
        });
    });
}

/**
 * Delete a meeting
 * @param {String} hostname The OT server host name
 * @param {String} vanity The identifier of the meeting to delete
 */

function deleteMeeting(hostname, vanity) {

    return new Promise(function(resolve, reject) {

        log_debug("AJAX", "Delete meeting", hostname, vanity);

        var url = "http://" + hostname + "/cgi-bin/vcs_conf_delete?delete_vanity=" + vanity + "&all_vanities=true&hide_temp_confs=true&show_conf_passwords=true";
        
        _request(url).then(function(jsonResponse) {
            log_debug("AJAX", "Received", jsonResponse);
            resolve(jsonResponse);
        }, function(err) {
            log_error("AJAX", "deleteMeeting", err);
            reject();
        });
    });
}

function askForRosterInvites(hostname) {
    //return new Promise(function(resolve, reject) {

        log_info("AJAX", "Ask for rosters invites");

        var url = "http://" + hostname + "/ics?action=get_roster_invites";
        
        _request(url).then(function(jsonResponse) {
            log_debug("AJAX", "Received", jsonResponse);
            //resolve(jsonResponse);
        }, function(err) {
            log_error("AJAX", "askForRosterInvites", err);
            //reject();
        });
    //});
}

function _getDay(day) {
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

function openEventPipe(hostname) {

    var timeoutID = -1;

    var rosters = [];

    log_info("AJAX", "Try to open the Event Pipe...");

    return new Promise(function(resolve, reject) {

        var url = "http://" + hostname + "/ics?action=open_server_interface&mode=simple&api_scope=s";

        url += "&_nocachex=" + Math.floor(Math.random()*2147483647);

        socket = new XMLHttpRequest();

        log_debug("AJAX", "Send", url);
        
        var parts = url.split('?');
        socket.open("POST", parts[0], true);

        var response_index = 0;

        //var that = this;

        socket.onreadystatechange = function () {

            // status produces a javascript error in IE when readyState != 4.
            var success = this.readyState !== 4 || Math.floor(this.status/100) === 2;

            // Parse a new data chunk
            if (success && (this.readyState === 3 || this.readyState === 4)) {
                var index = this.responseText.indexOf('\n', response_index);

                while (index > 0) {
                    var command = this.responseText.substr(response_index, index - response_index);

                    if (command.length > 5) {
                        // Split the command apart, so we don't eval executable code,
                        // causing a cross-site scripting error.
                        var paren = command.indexOf('(');
                        var dot = command.indexOf('.');
                        var e = command.substring(dot+1, paren);
                        //var params = '[' + command.substring(paren+1, command.length-2) + ']';
                        var params = command.substring(paren+1, command.length-2);

                        //m_debug.gotEvent(e, command.length+1);
                        log_debug("PIPE", "Event", e);
                        //self[e].apply(self, eval(params));
                        
                        // Fire the event
                        //that.fireEvent(e, eval(params));

                        // var data = eval(params);
                        var data = params.split(', ');
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].length > 2) {

                                data[i] = data[i].substring(1, data[i].length-1);
                            }
                        }
                        log_debug("PIPE", "Parameters", data);

                        if(e === 'Initialize') {
                            var ACSVersion = "Unknown";

                            if(data && data.length > 0) {
                                ACSVersion = data[0];
                            }

                            log_debug("PIPE", "Event pipe channel opened with ACS", ACSVersion);

                            // Ask for roster invites
                            askForRosterInvites(hostname);

                            // Wait no more than 500ms before ending the event pipe.
                            // If an updateConference event is received, restart the timer to be sure to receive others updateConference events if exists
                            timeoutID = setTimeout(function(){
                                resolve(rosters);
                            }, 500);
                        }

                        if(e === 'UpdateConference') {
                            log_debug("PIPE", "Rosters received", data);

                            rosters.push(data);

                            // Start timer to detect end of rosters received
                            if(timeoutID > -1) {
                                clearTimeout(timeoutID);
                            }
                            timeoutID = setTimeout(function() {
                                resolve(rosters);
                            }, 300);
                        }

                        if(e === 'UpdateBuddyData') {
                            if(data.length >9) {
                                var email = data[0],
                                    firstname = '',
                                    lastname = '';

                                var field = data[3].split('=');
                                if(field && field.length === 2 && field[0] === 'firstName') {
                                    firstname =  field[1];

                                }
                                field = data[9].split('=');
                                if(field && field.length === 2 && field[0] === 'name') {
                                    lastname =  field[1];
                                }

                                if(!(email in contacts) && lastname.length > 0 && firstname.length > 0) {
                                    contacts[email] = {id: email, firstname: firstname, lastname: lastname};
                                    log_debug("PIPE", "Add new contact", contacts[email]);
                                }

                            }
                        }
                    }
                    response_index = index + 1;
                    index = this.responseText.indexOf('\n', response_index);
                }
            }

            // The connection was lost.
            if (this.readyState === 4) {
                log_warning("PIPE", "Connection lost to Event Pipe");
                //if (!backgroundMode)
                //  repair("socket_broken");
            }
        };

        socket.onProgress = function(e) {
            log_debug("PIPE", "Progress", e);
        };

        socket.onError = function(e) {
            log_error("PIPE", "openEventPipe", e);    
            reject();
        };

        socket.send(parts[1]);
    });
}

function closeEventPipe() {
    log_info("AJAX", "Try to close the Event Pipe...");
    socket.abort();
    socket = null;
}


