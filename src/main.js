// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
    	"text": '../vendor/text'
    },
    waitSeconds: 5
});


require(['modules/log', 'views/mainView'], function(log, MainView) {

	var mainView = null;

	log.info('MAIN', "Application start");

	var lang = navigator.language || navigator.userLanguage || 'en-US';

    log.debug('POPUP', 'Detected language', lang);

    //Moment settings
    moment.locale(lang, {week: {dow: 1, doy: 4}});

    //Language initialization
    i18n.init({ lng: lang}, function() {
        log.info('POPUP', 'I18n initialized');

        log.info('POPUP', 'Display main view');
        Backbone.Mediator.subscribe('main-settings', function() {
            displayConfig(onLoad, this);
        });

        Backbone.Mediator.subscribe('main-about', function() {

        });

        mainView = new MainView();
        $('#main-elt').append(mainView.render().el);

        // Initialize the extension
        //init();

        // Load the extension
        //onLoad();
    });

});