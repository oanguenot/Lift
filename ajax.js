/**
 * Manage request thru the ACS
 * Use Promise to deal with asynchrounous call
 */


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
                    console.log("--- Error", http);
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

        console.log("--login");
    
        //Login with user data
        var url = "http://" + host_param +"/ics?action=signin&userid=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&remember_password=false&display=none";

        _request(url).then(function(jsonResponse) {
            console.log("data", jsonResponse);
            if(jsonResponse && jsonResponse.data !== null) {
                console.log("--logIn Error");
                reject();
            }
            else {
                console.log("--logIn Successfull", jsonResponse);
                resolve();
            }
            
        }, function(err) {
            console.log("--logIn Error", err);
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

        console.log("--getGlobalSettings");

        /* __FIX__ Get the timezone */
        var url = "http://" + host_param + "/cgi-bin/vcs?settings=global;phone;password&show_timezones=true";

        _request(url).then(function(jsonResponse) {
            console.log("--getGlobalSettings Successfull", jsonResponse);
            resolve(jsonResponse);
        }, function(err) {
            console.log("--getGlobalSettings Error", err);
            reject();
        });
    });
}

function getListofMeetings() {

    return new Promise(function(resolve, reject) {

        console.log("--getListofMeetings");

        var url = "http://" + host_param + "/cgi-bin/vcs?all_vanities=true&hide_temp_confs=true&show_conf_passwords=true&call_data=true";

        _request(url).then(function(jsonResponse) {
            console.log("--getListofMeetings Successfull");
            resolve(jsonResponse);
        }, function(err) {
            console.log("--getListofMeetings Error", err);
            reject();
        });

    });
}

function scheduleMeeting(params) {

    return new Promise(function(resolve, reject) {

        console.log("--scheduleConference", params);

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
            console.log("--scheduleConference Successfull");
            resolve(jsonResponse);
        }, function(err) {
            console.log("--scheduleConference Error", err);
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

    console.log("hostname, vanity", hostname, vanity);
    
    return new Promise(function(resolve, reject) {

        console.log("--deleteMeeting");

        var url = "http://" + hostname + "/cgi-bin/vcs_conf_delete?delete_vanity=" + vanity + "&all_vanities=true&hide_temp_confs=true&show_conf_passwords=true";
        
        _request(url).then(function(jsonResponse) {
            console.log("--deleteMeeting Successfull");
            resolve(jsonResponse);
        }, function(err) {
            console.log("--deleteMeeting Error", err);
            reject();
        });

    });
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
