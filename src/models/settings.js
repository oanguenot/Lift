define('models/settings', ['modules/acsConnector', 'modules/log'], function(acs, log) {

    "use strict";

    return Backbone.Model.extend({

        defaults: {
            timezones: null,
            defaultTimezone: null,
            conferenceCall: null,
            acsVersion: '-',
            protocol: 'https:',
            domain: ''
        },

        getConferenceCallInformation: function() {
            return this.get('conferenceCall');
        },

        getACSVersion: function() {
            return this.get('acsVersion');
        },

        getDomain: function() {
            return this.get('domain');
        },

        getProtocol: function() {
            return this.get('protocol');
        },

        getAudioPasswordRules: function() {
            return this.get('audiopassword');
        },

        getWebPasswordRules: function() {
            return this.get('webpassword');
        },

        getGlobals: function() {

            Backbone.Mediator.publish('spinner-on');

            acs.getGlobalSettings(function(jsonResponse) {

                var timezone, timezones = [], conferenceCall = {}, acsVersion = '';

                var domain, protocol = 'https:';

                var settings = jsonResponse.data;

                if(settings) {

                    acsVersion = settings.documentElement.getAttribute("build");

                    if(settings.getElementsByTagName('domain')) {
                        domain = settings.getElementsByTagName("domain")[0].childNodes[0].nodeValue;    
                    }

                    if(settings.getElementsByTagName('http_protocol')) {
                        protocol = settings.getElementsByTagName("http_protocol")[0].childNodes[0].nodeValue;    
                    }

                    var timezoneElt = settings.getElementsByTagName("timezone");

                    if(timezoneElt && timezoneElt.length > 0) {
                        timezone = timezoneElt[0].childNodes[0].nodeValue;
                        log.debug("SETTINGS", "Server Timezone found", timezone);    
                    }
                    else {
                        log.warning("SETTINGS", "No server Timezone found, use default", timezone);
                    }

                    var timezonesListElt = settings.getElementsByTagName('timezones');

                    if(timezonesListElt && timezonesListElt.length > 0) {
                        var timezonesList = timezonesListElt[0].getElementsByTagName('name');

                        for (var i=0, l=timezonesList.length; i < l;i++) {
                            timezones.push(timezonesList[i].innerHTML);
                        }

                        log.debug("SETTINGS", "List of Timezones found", timezones);    
                    }
                    else {

                        timezones.push(timezone);

                        log.warning("SETTINGS", "No list of timezones provided, add only default timezone", timezones);
                    }

                    var phone = settings.getElementsByTagName("phone");

                    if(phone && phone.length > 0) {
                        
                        log.debug("SETTINGS", "Conference Bridge information found", phone);

                        var phoneName = '',
                            phoneNumber = '';

                        for (var j=0, len = phone.length; j < len; j++) {
                            phoneName = phone[j].getAttribute('type');
                            if(phone[j].childNodes && phone[j].childNodes.length > 0) {
                                phoneNumber = phone[j].childNodes[0].nodeValue;
                            }
                            
                            if(phoneName && phoneName.length > 0 && phoneNumber && phoneNumber.length > 0) {
                                
                                if(!(phoneName in conferenceCall)) {
                                    conferenceCall[phoneName] = phoneNumber;
                                    log.debug("SETTINGS", "Add Conference call information", {name: phoneName, number: phoneNumber});    
                                }
                                else {
                                    log.info("SETTINGS", "Conference call already exists");
                                }
                            }
                            else {
                                log.warning("SETTINGS", "Conference call information read not used", {name: phoneName, number: phoneNumber});
                            }
                        }
                    }
                    else {
                        log.warning("SETTINGS", "No Conference bridge information found");
                    }

                    var webpassword = {}, audiopassword = {};

                    var web_password_rules = settings.getElementsByTagName("conf_web_password_rules");
                    if(web_password_rules && web_password_rules.length > 0) {
                        
                        if(web_password_rules[0].getElementsByTagName('min_length') && web_password_rules[0].getElementsByTagName('min_length').length > 0) {
                            webpassword.min_length = web_password_rules[0].getElementsByTagName('min_length')[0].childNodes[0].nodeValue;
                        }
                        
                        if(web_password_rules[0].getElementsByTagName('digit') && web_password_rules[0].getElementsByTagName('digit').length > 0) {
                            webpassword.hasDigit = web_password_rules[0].getElementsByTagName('digit')[0].childNodes[0].nodeValue === "true" ? true : false;
                        }
                        if(web_password_rules[0].getElementsByTagName('lowercase') && web_password_rules[0].getElementsByTagName('lowercase').length > 0) {
                            webpassword.hasLowercase = web_password_rules[0].getElementsByTagName('lowercase')[0].childNodes[0].nodeValue === "true" ? true : false;
                        }
                        if(web_password_rules[0].getElementsByTagName('uppercase') && web_password_rules[0].getElementsByTagName('uppercase').length > 0) {
                            webpassword.hasUppercase = web_password_rules[0].getElementsByTagName('uppercase')[0].childNodes[0].nodeValue === "true" ? true : false;
                        }
                        if(web_password_rules[0].getElementsByTagName('special') && web_password_rules[0].getElementsByTagName('special').length > 0) {
                            webpassword.hasSpecial = web_password_rules[0].getElementsByTagName('special')[0].childNodes[0].nodeValue === "true" ? true : false;
                        }
                    }

                    var audio_password_rules = settings.getElementsByTagName("conf_audio_password_rules");
                    if(audio_password_rules && audio_password_rules.length > 0) {
                         if(audio_password_rules[0].getElementsByTagName('min_length') && audio_password_rules[0].getElementsByTagName('min_length').length > 0) {
                            audiopassword.min_length = audio_password_rules[0].getElementsByTagName('min_length')[0].childNodes[0].nodeValue;
                        }
                    }

                    this.set({
                        timezones: timezones,
                        defaultTimezone: timezone,
                        conferenceCall: conferenceCall,
                        acsVersion: acsVersion,
                        protocol: protocol,
                        domain: domain,
                        webpassword: webpassword,
                        audiopassword: audiopassword
                    });

                    log.debug("SETTINGS", "Settings stored", this);

                }
                else {
                    log.warning("SETTINGS", "No Global settings defined for that server");
                }

                Backbone.Mediator.publish('spinner-off');


            }, function() {
                log.error("SETTINGS", "Error retrieving global settings");
                Backbone.Mediator.publish('spinner-off');
            }, this);
        }
    });
});