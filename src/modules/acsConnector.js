define('modules/acsConnector', ['modules/log'], function(log) {

    var protocol = 'https://',
        host = '';

    var socket = null;

    var getDay = function getDay(day) {
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
    };

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

    var login = function login(username, password) {

        if(!host && !username && !password) {
            return;
        }

        return new Promise(function(resolve, reject) {

            log.debug("ACSConnector", "Login with", {login: username, host: host});

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

    var getGlobalSettings = function getGlobalSettings() {

        return new Promise(function(resolve, reject) {

            log.info("ACSConnector", "Get global server settings");

            /* __FIX__ Get the timezone */
            var url = protocol + host + "/cgi-bin/vcs?settings=global;phone;password&show_timezones=true";

            request(url).then(function(jsonResponse) {
                log.debug("ACSConnector", "Settings Received", jsonResponse);
                resolve(jsonResponse);
            }, function(err) {
                log.error("ACSConnector", "getGlobalSettings", err);
                reject();
            });
        });
    };

    var getListOfMeetings = function getListOfMeetings() {

        return new Promise(function(resolve, reject) {

            log.info("ACSConnector", "Get the list of meetings");

            var url = protocol + host + "/cgi-bin/vcs?all_vanities=true&hide_temp_confs=true&show_conf_passwords=true&call_data=true";

            request(url).then(function(jsonResponse) {
                log.debug("ACSConnector", "Meetings Received", jsonResponse);
                resolve(jsonResponse);
            }, function(err) {
                log.error("ACSConnector", "getListOfMeetings", err);
                reject();
            });
        });
    };

    var signout = function signout() {

        return new Promise(function(resolve, reject) {

            log.info("ACSConnector", "Signout");

            // Logout previous user - if any
            var url = protocol + host + "/ics?action=signout";

            request(url).then(function(jsonResponse) {
                log.debug("ACSConnector", "Signout successfull", jsonResponse);
                resolve();
            }, function(err) {
                log.error("ACSConnector", "Signout error", err);
                reject();
            });
        });
    };

    var schedule = function schedule(params) {

        return new Promise(function(resolve, reject) {

            log.debug("ACSConnector", "Schedule a new meeting", params);

            var day = getDay(moment(params.start).day() + 1);

            var url = protocol + host + 
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

            request(url).then(function(jsonResponse) {
                log.debug("ACSConnector", "Received", jsonResponse);
                resolve(jsonResponse);
            }, function(err) {
                log.error("ACSConnector", "scheduleMeeting", err);
                reject();
            });
        });
    };

    var deleteMeeting = function deleteMeeting(vanity) {

        return new Promise(function(resolve, reject) {

            log.debug("ACSConnector", "Delete meeting", vanity);

            var url = protocol + host + "/cgi-bin/vcs_conf_delete?delete_vanity=" + vanity + "&all_vanities=true&hide_temp_confs=true&show_conf_passwords=true";
            
            request(url).then(function(jsonResponse) {
                log.debug("ACSConnector", "Received", jsonResponse);
                resolve(jsonResponse);
            }, function(err) {
                log.error("ACSConnector", "deleteMeeting", err);
                reject();
            });
        });
    };

    var askForRosterInvites = function askForRosterInvites() {

        log.info("AJAX", "Ask for rosters invites");

        var url = protocol + host + "/ics?action=get_roster_invites";
        
        request(url).then(function(jsonResponse) {
            log.debug("AJAX", "Received", jsonResponse);
        }, function(err) {
            log.error("AJAX", "askForRosterInvites", err);
        });
    };

    var openEventPipe = function openEventPipe() {

        var timeoutID = -1;

        var rosters = [];

        var contacts = {};

        log.info("AJAX", "Try to open the Event Pipe...");

        return new Promise(function(resolve, reject) {

            var url = protocol + host + "/ics?action=open_server_interface&mode=simple&api_scope=s";

            url += "&_nocachex=" + Math.floor(Math.random()*2147483647);

            socket = new XMLHttpRequest();

            log.debug("AJAX", "Send", url);
            
            var parts = url.split('?');
            socket.open("POST", parts[0], true);

            var response_index = 0;

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
                            
                            var params = command.substring(paren+1, command.length-2);

                            //log.debug("PIPE", "Event", e);

                            var data = params.split(', ');
                            for(var i = 0; i < data.length; i++) {
                                if(data[i].length > 2) {

                                    data[i] = data[i].substring(1, data[i].length-1);
                                }
                            }
                            //log.debug("PIPE", "Parameters", data);

                            if(e === 'Initialize') {
                                var ACSVersion = "Unknown";

                                if(data && data.length > 0) {
                                    ACSVersion = data[0];
                                }

                                log.debug("PIPE", "Event pipe channel opened with ACS", ACSVersion);

                                // Ask for roster invites
                                askForRosterInvites();

                                // Wait no more than 500ms before ending the event pipe.
                                // If an updateConference event is received, restart the timer to be sure to receive others updateConference events if exists
                                timeoutID = setTimeout(function(){
                                    resolve(rosters);
                                }, 3000);
                            }

                            if(e === 'UpdateConference') {
                                log.debug("PIPE", "Rosters received", data);

                                rosters.push(data);

                                // Start timer to detect end of rosters received
                                if(timeoutID > -1) {
                                    clearTimeout(timeoutID);
                                }
                                timeoutID = setTimeout(function() {
                                    resolve(rosters);
                                }, 500);
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
                                        log.debug("PIPE", "Add new contact", contacts[email]);
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
                    log.warning("PIPE", "Connection lost to Event Pipe");
                    //if (!backgroundMode)
                    //  repair("socket_broken");
                }
            };

            socket.onProgress = function(e) {
                log.debug("PIPE", "Progress", e);
            };

            socket.onError = function(e) {
                log.error("PIPE", "openEventPipe", e);    
                reject();
            };

            socket.send(parts[1]);
        });
    };

    var closeEventPipe = function closeEventPipe() {
        log.info("AJAX", "Try to close the Event Pipe...");
        socket.abort();
        socket = null;
    };

    return {

        /**
         * Login to ACS
         */

        loginToACS: function(hostname, username, password, callback, errCallback, context) {

            log.info("ACSConnector", "Try to log...");
            
            host = hostname;

            login(username, password).then(function(){
                callback.call(context);
            }, function() {
                errCallback.call(context);
            }); 
        },

        /**
         * Log off the logged in user from ACS
         */
        logoffFromACS: function(callback, errCallback, context) {
            log.info("ACSConnector", "Try to signout...");

            signout().then(function(){
                callback.call(context);
            }, function() {
                errCallback.call(context);
            });
        },  

        /**
         * Retrieve global settings (timezone and conference call)
         */

        getGlobalSettings: function(callback, errCallback, context) {
            getGlobalSettings().then(function(params){
                callback.call(context, params);
            }, function() {
                errCallback.call(context);
            });
        },

        /**
         * Retrieve list conferences scheduled by the user himself
         */

        getMeetings: function(callback, errCallback, context) {
            getListOfMeetings().then(function(params){
                callback.call(context, params);
            }, function() {
                errCallback.call(context);
            });
        },

        /**
         * Schedule a Meeting
         */

        scheduleMeeting: function(meeting, callback, errCallback, context) {
            schedule(meeting).then(function(params){
                callback.call(context, params);
            }, function() {
                errCallback.call(context);
            });
        },

        /**
         * Delete a meeting
         * @param {String} vanity The identifier of the meeting to delete
         */

        deleteMeeting: function(vanity, callback, errCallback, context) {
            deleteMeeting(vanity).then(function(params) {
                callback.call(context, params);
            }, function() {
                errCallback.call(context);
            });
        },

        /**
         * Open the event Pipe to get the roster invitation
         */
        getRostersInvite: function(callback, errCallback, context) {
            openEventPipe().then(function(rosters) {
                closeEventPipe();
                callback.call(context, rosters);
            }, function() {
                errCallback.call(context);
            });
        }
    };

});