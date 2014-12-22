// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
    	"text": '../vendor/text'
    },
    waitSeconds: 5
});


require(['modules/log', 'modules/acsConnector', 'modules/credentials', 'views/mainView', 'views/errorView', 'views/configView', 'models/user'], function(log, acs, credentials, MainView, ErrorView, ConfigView, UserModel) {

	var mainView = null;

    var user = new UserModel();

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
        var view = new ConfigView({model: user});

        Backbone.Mediator.subscribe('settings-close', function() {
            view.close();
            mainView.unblur();
        });

        mainView.blur();

        $('#config-elt').append(view.render().el);
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

        Backbone.Mediator.subscribe('error-display', function() {
            displayErrorLoginPopup();
        });
        
        mainView = new MainView();
        $('#main-elt').append(mainView.render().el);

        user.on('change', function(model) {
            console.log("New Model", model);
        });

        user.signin();
       

    });

});