// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
    	"text": '../vendor/text'
    },
    waitSeconds: 5
});


require(['modules/log', 'modules/acsConnector', 'modules/credentials', 'views/mainView', 'views/errorView', 'views/configView'], function(log, acs, credentials, MainView, ErrorView, ConfigView) {

	var mainView = null;

    var user = null;

	log.info('MAIN', "Application start");

	var lang = navigator.language || navigator.userLanguage || 'en-US';

    log.debug('MAIN', 'Detected language', lang);

    //Moment settings
    moment.locale(lang, {week: {dow: 1, doy: 4}});

    function displayErrorLoginPopup()  {
        
        var view = new ErrorView();

        Backbone.Mediator.subscribe('error-close', function() {
            view.close();
            mainView.unblur();
        });

        mainView.blur();

        $('#error-elt').append(view.render().el);
    }

    function displayConfig() {

    }

    //Language initialization
    i18n.init({ lng: lang}, function() {
        log.info('MAIN', 'I18n initialized');

        
        // Display main view
        Backbone.Mediator.subscribe('main-settings', function() {
            displayConfig();
        });

        Backbone.Mediator.subscribe('main-about', function() {

        });
        
        mainView = new MainView();
        $('#main-elt').append(mainView.render().el);

        // Try to log to the ACS server
        credentials.load(function(user_param) {
            user = user_param;
            log.debug("MAIN", "User found", user);

            if(user.host.length > 0 && user.login.length > 0 && user.password.length > 0) {
                acs.loginToACS(user.host, user.login, user.password, function() {

                }, function() {

                });
            }
            else {
                displayErrorLoginPopup();    
            }
        }, function() {
            displayErrorLoginPopup();
        }, this);

    });

});