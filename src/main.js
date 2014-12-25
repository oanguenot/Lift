// Configuration for require.js
require.config({
    baseUrl: "/src",
    paths : {
    	"text": '../vendor/text',
        "json": '../vendor/json'
    },
    waitSeconds: 5
});


require(['modules/log', 'views/mainView', 'views/errorView', 'views/configView', 'views/joinView', 'views/editorView', 'views/aboutView', 'models/user', 'models/settings', 'models/conferences'], function(log, MainView, ErrorView, ConfigView, JoinView, EditorView, AboutView, UserModel, SettingsModel, ConferencesCollection) {

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

    function displayEditor() {
        var view = new EditorView();

         Backbone.Mediator.subscribeOnce('editor-close', function() {
            view.close();
            displayMainView();
        });

        mainView.close();

        $('#editor-elt').append(view.render().el);
    }

    function displayMainView() {
        mainView = new MainView({collection: conferences});
        $('#main-elt').append(mainView.render().el);
    }

    function displayDetailsPopup(model) {

    }

    function displayAboutWindow() {
      
        var view = new AboutView();

        Backbone.Mediator.subscribeOnce('about-close', function() {
            view.close();
            mainView.unblur();
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
            displayAboutWindow();
        });

        Backbone.Mediator.subscribe('editor-about', function() {
            displayAboutWindow();
        });

        Backbone.Mediator.subscribe('main-meeting', function() {
            displayEditor();
        });

        Backbone.Mediator.subscribe('error-display', function() {
            displayErrorLoginPopup();
        });

        Backbone.Mediator.subscribe('conference-join', function(model) {
            displayJoinPopup(model);
        });

        Backbone.Mediator.subscribe('conference-details', function(model) {
            displayDetailsPopup(model);
        });

        Backbone.Mediator.subscribe('about-terms', function() {
            var params = {'id': 'terms', 'outerBounds': { 'width': 500, 'height': 600, 'top': 100, 'left': 300}};
            chrome.app.window.create('terms.html', params);
        }),
        
        displayMainView();

        user.on('change:isConnected', function(model) {
            if(user.isConnected()) {
                settings.getGlobals();
                conferences.list();
            }
        });

        user.signin();
       

    });

});