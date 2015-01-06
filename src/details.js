// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
        "text": '../vendor/text',
        "json": '../vendor/json',
        "models": "./models"
    },
    waitSeconds: 5
});

function displayDetails(model) {
    console.log("Details to display", model);

    require(['modules/log', 'views/meetingDetails'], function(log, MeetingDetails) {

        "use strict";

        var lang = navigator.language || navigator.userLanguage || 'en-US';

        console.log('DETAILS', 'Detected language', lang);

        //Moment settings
        moment.locale(lang, {week: {dow: 1, doy: 4}});

        //Language initialization
        i18n.init({ lng: lang}, function() {
            console.log('DETAILS', 'I18n initialized');

            var view = new MeetingDetails({model: model});

            $('#details').append(view.render().el);
        });
    });

}

