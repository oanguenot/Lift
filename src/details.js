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


window.displayDetails = function displayDetails(model) {

    require(['modules/log', 'views/meetingDetails'], function(log, MeetingDetails) {

        "use strict";

        var lang = navigator.language || navigator.userLanguage || 'en-US';

        //Moment settings
        moment.locale(lang, {week: {dow: 1, doy: 4}});

        //Language initialization
        i18n.init({ lng: lang}, function() {

            var view = new MeetingDetails({model: model});

            $('#details').append(view.render().el);
        });
    });
};
