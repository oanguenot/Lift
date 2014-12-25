define('models/settings', ['modules/acsConnector', 'modules/log'], function(acs, log) {

    return Backbone.Model.extend({

        defaults: {
            timezones: null,
            conferenceCall: null,
            acsVersion: null
        },

        getACSVersion: function() {
            return this.get('acsVersion');
        },

        getGlobals: function() {
            acs.getGlobalSettings(function(jsonResponse) {

                var timezone, timezones = [], conferenceCall = {}, acsVersion = '';

                var settings = jsonResponse.data;

                if(settings) {

                    acsVersion = settings.documentElement.getAttribute("build");

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


                    this.set({
                        timezones: timezones,
                        conferenceCall: conferenceCall,
                        acsVersion: acsVersion
                    });

                    log.debug("SETTINGS", "Settings stored", this);

                }
                else {
                    log.warning("SETTINGS", "No Global settings defined for that server");
                }


            }, function() {
                log.error("SETTINGS", "Error retrieving global settings");
            }, this);
        }
    });
});