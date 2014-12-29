function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

define('models/conferences', ['models/conference', 'modules/acsConnector', 'modules/log'], function(ConferenceModel, acs, log) {

    var parseVCSConference = function parseVCSConference(xml) {

        console.log("XML", xml);

        var json = {};

        //Conference Type
        json.typeConf = xml.getAttribute("type");
        //Conference subject
        json.subject = i18n.t("conference.unnamed");
        if(xml.getElementsByTagName("subject")[0]) {
            json.subject = xml.getElementsByTagName("subject")[0].childNodes[0].nodeValue;
        }
        // Conference owner
        json.from = '';
        if(xml.getElementsByTagName('owner')) {
            json.from = xml.getElementsByTagName("owner")[0].childNodes[0].nodeValue;    
        }

        // Conference date
        json.day = xml.getElementsByTagName('time')[0].getElementsByTagName('day')[0].textContent;
        if(parseInt(json.day, 10) < 10) {
            json.day = '0' + json.day;
        }
        json.month = xml.getElementsByTagName('time')[0].getElementsByTagName('month')[0].textContent;
        if(parseInt(json.month, 10) < 10) {
            json.month = '0' + json.month;
        }
        json.year = xml.getElementsByTagName('time')[0].getElementsByTagName('year')[0].textContent;
        json.day_end = xml.getElementsByTagName('time')[1].getElementsByTagName('day')[0].textContent;
        json.month_end = xml.getElementsByTagName('time')[1].getElementsByTagName('month')[0].textContent;
        json.year_end = xml.getElementsByTagName('time')[1].getElementsByTagName('year')[0].textContent;

        // Conference profile
        json.webinar = 'false';
        if(xml.getElementsByTagName('options')[0].getElementsByTagName('webinar_mode').length > 0) {
            json.webinar = xml.getElementsByTagName('options')[0].getElementsByTagName('webinar_mode')[0].textContent;
        }

        json.training = 'false';
        if(xml.getElementsByTagName('options')[0].getElementsByTagName('owner_starts_presentation').length > 0) {
            json.training = xml.getElementsByTagName('options')[0].getElementsByTagName('owner_starts_presentation')[0].textContent;
        }

        json.call = 'false';
        if(xml.getElementsByTagName('options')[0].getElementsByTagName('audio_only').length > 0) {
            json.call = xml.getElementsByTagName('options')[0].getElementsByTagName('audio_only')[0].textContent;
        }

        json.profile = 'meeting';
        if(json.webinar === 'true') {
            json.profile = 'webinar';
        } else if (json.training === 'true') {
            json.profile = 'training';
        } else if (json.call === 'true') {
            json.profile = 'call';
        }       

        // Conference recurrence
        json.hasRecurrence = false;
        json.recurrenceType = "";
        if(xml.getElementsByTagName("recurrence").length > 0) {
            json.hasRecurrence = true;
            json.recurrenceType = xml.getElementsByTagName("recurrence")[0].getAttribute('type');
            json.pattern = xml.getElementsByTagName("recurrence")[0].getAttribute('pattern');
            if(json.pattern === 'D-WE') {
                json.recurrenceType = 'daily';
            }
        }

        // Conference duration
        json.duration = 0;
        json.hour = xml.getElementsByTagName("hour")[0].childNodes[0].nodeValue;
        if(parseInt(json.hour, 10) === 0)  {
            json.hour = "00";
        } else if (parseInt(json.hour, 10) < 10) {
            json.hour = "0" + json.hour;
        }
        
        json.minute = xml.getElementsByTagName("minute")[0].childNodes[0].nodeValue;
        if(parseInt(json.minute, 10) === 0) {
            json.minute = "00";
        } else if (parseInt(json.minute, 10) < 10) {
            json.minute = "0" + json.minute;
        }

        json.hour_end = xml.getElementsByTagName("hour")[1].childNodes[0].nodeValue;
        if(parseInt(json.hour_end, 10) === 0) {
            json.hour_end = "00";
        } else if(parseInt(json.hour_end, 10) < 10) {
            json.hour_end = "0" + json.hour_end;
        }
        
        json.minute_end = xml.getElementsByTagName("minute")[1].childNodes[0].nodeValue;
        if(parseInt(json.minute_end, 10) === 0) {
            json.minute_end = "00";
        } else if(parseInt(json.minute_end, 10) < 10) {
            json.minute_end = "0" + json.minute_end;
        }
        json.duration = parseInt(json.hour_end, 10) - parseInt(json.hour, 10);

        json.startDate = moment(json.year + '-' + json.month + '-' + json.day, "YYYY-MM-DD");
        json.meetingStartDate = json.startDate.format('YYYY-MM-DD');
        json.startDate.add(parseInt(json.hour, 10), 'h').add(parseInt(json.minute, 10), 'm');

        json.startDateString = json.startDate.format("dddd, MMMM Do");

        json.endDate = moment(json.year_end + '-' + json.month_end + '-' + json.day_end, "YYYY-MM-DD");
        json.meetingEndDate = json.endDate.format('YYYY-MM-DD');
        json.endDate.add(parseInt(json.hour_end, 10), 'h').add(parseInt(json.minute_end, 10), 'm');

        json.startDateStringNext = "";
        if(json.hasRecurrence) {
            switch (json.recurrenceType) {
                case "weekly":
                    json.startDateString = i18n.t("conference.each") + " " + json.startDate.format("dddd");
                    json.startDateStringNext = json.startDate.format("MMMM Do") + " - " + json.endDate.format("MMMM Do");
                    break;
                case "daily":
                    json.startDateString = i18n.t("conference.eachweekday");
                    json.startDateStringNext = json.startDate.format("MMMM Do") + " - " + json.endDate.format("MMMM Do");
                    break;
            }
        }

        json.startTimeString = "";
        json.endTimeString = "";
        json.scheduledEndTime = "";

        var now = moment();
        var days = -1;

        if(json.typeConf === "scheduled") {

            json.startTimeString = json.startDate.format('HH:mm');
            json.endTimeString = json.hour_end + ":" + json.minute_end;

            if(json.hasRecurrence) {
                json.scheduledEndTime = null;
                json.scheduledEndTime = json.startDate.clone();
                json.duration = parseInt(xml.getElementsByTagName('recurrence')[0].getElementsByTagName('duration')[0].textContent, 10) / 3600 ;
                json.scheduledEndTime.add(json.duration, 'h');            
                json.endTimeString = json.scheduledEndTime.format('HH:mm');
            }
        }
        else {

            json.startDateString = i18n.t("conference.eachday");
            json.startDateStringNext = json.startDate.format("ll") + " - " + json.endDate.format("ll");

            if(now.isAfter(json.startDate)) {
                if(now.isAfter(json.endDate)) {
                    days = -1;
                }
                else {
                    days = json.endDate.utc().diff(now.utc(), 'days');
                }
            }
            else {
                days = json.endDate.utc().diff(json.startDate.utc(), 'days');
            }
        }

        // Conference Timerone
        json.timezone = xml.getElementsByTagName("timezone")[0].childNodes[0].nodeValue;

        // Conference vanity
        json.vanity = xml.getElementsByTagName("vanity")[0].childNodes[0].nodeValue;

        // Conference state
        json.state = xml.getElementsByTagName("access")[1].getAttribute("state") || i18n.t('conference.unknown');

        json.profileDisplayed = i18n.t('conference.' + json.profile);

        json.stateDisplayed = capitaliseFirstLetter(json.profileDisplayed) + ' / ' + capitaliseFirstLetter(json.state);

        var documents = xml.getElementsByTagName('document');
        if (documents && documents.length > 0) {
            if(documents.length === 1) {
                json.stateDisplayed += ' / 1 ' + i18n.t('conference.file');
            } else {
                json.stateDisplayed += ' - ' + documents.length + ' ' + i18n.t('conference.files');
            }
        }

        json.access = xml.getElementsByTagName("access");
        json.role = "participant";

        json.callVanityLeader = '';
        json.callVanityParticipant = '';

        var vanityTag = '',
            codeTag = ''; 

        if(json.access) {
            for (var j = 0; j < json.access.length; j++) {
                
                var accessType = json.access[j].getAttribute('type');

                vanityTag = json.access[j].getElementsByTagName("vanity");

                codeTag = json.access[j].getElementsByTagName("code");

                if(accessType === 'leader') {

                    if(vanityTag && vanityTag.length > 0) {
                        json.role = "leader";
                    }

                    if(codeTag && codeTag.length > 0) {
                        json.callVanityLeader = codeTag[0].textContent; 
                    }
                }
                else {
                    if(vanityTag && vanityTag.length > 0) {
                        json.role = "participant";
                    }
                    if(codeTag && codeTag.length > 0) {
                        json.callVanityParticipant = codeTag[0].textContent;    
                    }   
                }
            }
        }

        json.path = "/call/";
        if(xml.getElementsByTagName("join_url_root") && xml.getElementsByTagName("join_url_root").length > 0) {
            json.path = xml.getElementsByTagName("join_url_root")[0].textContent;
        }

        json.password = '';
        if(xml.getElementsByTagName("documents") && xml.getElementsByTagName("documents").length > 0) {
            if(xml.getElementsByTagName("documents")[0].getElementsByTagName('password') && xml.getElementsByTagName("documents")[0].getElementsByTagName('password')[0]) {
                json.password = xml.getElementsByTagName("documents")[0].getElementsByTagName('password')[0].textContent;
            }    
        }

        // In case of invite, try to found the right identifier of the meeting's owner
        /*if(isAnInvite && from in contacts) {
            from = contacts[from].firstname + ' ' + contacts[from].lastname;
        }*/

        return (new ConferenceModel(json));
    };

    return Backbone.Collection.extend({
        model : ConferenceModel,

        schedule: function(meeting) {
            Backbone.Mediator.publish('spinner-on');

            acs.scheduleMeeting(meeting, function(jsonResponse) {

                var conference = null;

                var xmlResponse = jsonResponse.data;

                if(xmlResponse) {
                    var conferences = xmlResponse.getElementsByTagName("conference");
                    if(conferences.length === 1) {
                        var xml = conferences[0];
                        conference = parseVCSConference(xml);
                    }
                }

                Backbone.Mediator.publish('spinner-off');
                if(conference) {
                    Backbone.Mediator.publish('editor-schedule-ok', conference);
                    this.add(conference);
                }
                else {
                    Backbone.Mediator.publish('editor-schedule-error');
                }
                
            }, function() {
                Backbone.Mediator.publish('spinner-off');
                Backbone.Mediator.publish('editor-schedule-error');
            }, this);
        },

        delete: function(model) {
            Backbone.Mediator.publish('spinner-on');
            acs.deleteMeeting(model.get('vanity'), function() {
                Backbone.Mediator.publish('spinner-off');
                //TODO remove from
                this.remove(model); 
            }, function() {
                Backbone.Mediator.publish('spinner-off');
                Backbone.Mediator.publish('conference-delete-error', model.get('vanity'));
            }, this);
        },

        list: function() {

            Backbone.Mediator.publish('spinner-on');

            acs.getMeetings(function(jsonResponse) {

                var xmlResponse = jsonResponse.data;

                 if(xmlResponse) {
                    var conferences = xmlResponse.getElementsByTagName("conference");

                    var len = conferences.length;

                    log.debug("CONFERENCES", "Nb conferences", len);

                    if(len > 0) {

                        for(var i=0; i<len; i++) {

                            var xml = conferences[i];

                            var conference = parseVCSConference(xml);
                            
                            this.add(conference);
                        }   
                    }
                }

                Backbone.Mediator.publish('spinner-off');

            }, function() {

                Backbone.Mediator.publish('spinner-off');

            }, this);
        }
    });
});