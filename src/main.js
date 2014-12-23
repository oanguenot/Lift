// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
    	"text": '../vendor/text'
    },
    waitSeconds: 5
});


require(['modules/log', 'views/mainView', 'views/errorView', 'views/configView', 'views/joinView', 'models/user', 'models/settings', 'models/conferences'], function(log, MainView, ErrorView, ConfigView, JoinView, UserModel, SettingsModel, ConferencesCollection) {

	var mainView = null;

    var user = new UserModel(),
        settings = new SettingsModel(),
        conferences = new ConferencesCollection();

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

        Backbone.Mediator.subscribeOnce('settings-close', function() {
            view.close();
            mainView.unblur();
        });

        mainView.blur();

        $('#config-elt').append(view.render().el);
    }

    function displayJoinPopup(model) {
        var view = new JoinView({model: model});

        Backbone.Mediator.subscribeOnce('join-close', function() {
            view.close();
            mainView.unblur();
        });

        Backbone.Mediator.subscribeOnce('join-ok', function() {
            view.close();
            mainView.unblur();

            user.join(model.get('vanity'));
        });

        mainView.blur();

        $('#popup-elt').append(view.render().el);
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

        Backbone.Mediator.subscribe('conference-join', function(model) {
            console.log("MODEL", model);
            displayJoinPopup(model);
        });
        
        mainView = new MainView({collection: conferences});
        //mainView.setConferences(conferences);
        $('#main-elt').append(mainView.render().el);

        user.on('change:isConnected', function(model) {
            if(user.isConnected()) {
                settings.getGlobals();
                conferences.list();
            }
        });

        user.signin();
       

    });

});