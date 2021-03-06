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

require(['modules/log', 'views/mainView', 'views/errorView', 'views/configView', 'views/joinView', 'views/editorView', 'views/aboutView', 'views/confirmView', 'views/inviteView', 'models/models'], function(log, MainView, ErrorView, ConfigView, JoinView, EditorView, AboutView, ConfirmView, InviteView, models) {

    "use strict";

    var mainView = null;

    var user = models.user(),
        settings = models.settings(),
        conferences = models.conferences(),
        buddies = models.buddies();

    var spinner = null, nbSpinner = 0;

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

        $('#popup-elt').append(view.render().el);
    }

    function displayConfig() {
        var view = new ConfigView({model: user});

        Backbone.Mediator.subscribeOnce('settings-close', function() {
            view.close();
            mainView.unblur();
        });

        mainView.blur();

        $('#popup-elt').append(view.render().el);
    }

    function displayJoinPopup(model) {
        var view = new JoinView({model: model});

        Backbone.Mediator.subscribeOnce('join-close', function(shouldJoin) {
            view.close();
            mainView.unblur();
            if(shouldJoin) {
                user.join(model.get('vanity'));    
            }
        });

        mainView.blur();

        $('#popup-elt').append(view.render().el);
    }

    function displayEditor(model) {

        var view;

        if(model) {
            view = new EditorView({model: model});
        }
        else {
            view = new EditorView(); 
        }

        Backbone.Mediator.subscribeOnce('editor-close', function(isMeetingModified) {
            view.close();
            displayMainView();
            if(isMeetingModified) {
                user.reload();    
            } 
        });

        mainView.close();

        $('#editor-elt').append(view.render().el);
    }

    function displayInvite(model) {
        var view;

        view = new InviteView({model: model});

        Backbone.Mediator.subscribeOnce('invite-close', function() {
            view.close();
            displayMainView();
        });

        mainView.close();

        $('#invite-elt').append(view.render().el);
    }

    function displayMainView() {
        mainView = new MainView({collection: conferences});
        $('#main-elt').append(mainView.render().el);
    }

    function displayDetailsPopup(model) {
     
        var params = {'id': 'details-' + model.get('vanity'), 'outerBounds': { 'width': 440, 'height': 600, 'top': 100, 'left': 300}};
        chrome.app.window.create('details.html', params, function (myWindow) {
            myWindow.contentWindow.addEventListener('load', function() {
                
                setTimeout(function() {

                    var settings = models.settings();

                    model.set({'call': settings.getConferenceCallInformation(), 'domain': settings.getDomain(), 'protocol': settings.getProtocol()});

                    myWindow.contentWindow.displayDetails(model);
                }, 500);
                
            });
        });
    }

    function displayConfirmationPopup(model) {
        var view = new ConfirmView({model: model});

        Backbone.Mediator.subscribeOnce('confirm-close', function(shouldBeDeleted) {
            view.close();
            mainView.unblur();
            if(shouldBeDeleted) {
                models.conferences().delete(model);
            }
        });

        mainView.blur();

        $('#popup-elt').append(view.render().el);
    }

    function displayAboutWindow() {
      
        var view = new AboutView({model: settings});

        Backbone.Mediator.subscribeOnce('about-close', function() {
            view.close();
            mainView.unblur();
        });

        mainView.blur();

        $('#popup-elt').append(view.render().el);
    }

    function displaySpinner() {
        if(!spinner) {
            var opts = {
                lines: 11, // The number of lines to draw
                length: 16, // The length of each line
                width:6, // The line thickness
                radius: 24,// The radius of the inner circle
                corners: 1.0, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#fff', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 50, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spin', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent
                bottom: 80,
                left: '50%' // Left position relative to parent
            };

            var target = document.getElementById('spin');
            spinner = new Spinner(opts).spin(target);
            $('.spinner').removeClass('masked');
        }
        nbSpinner++;
    }

    function hideSpinner() {
        nbSpinner--;
        if(spinner && nbSpinner === 0) {
            spinner.stop();
            spinner = null;
            $('.spinner').addClass('masked'); 
        }
    }

    function updateMeetingsList() {
        conferences.list();
        conferences.getInvite();
    }

    //Language initialization
    i18n.init({ lng: lang}, function() {
        log.info('MAIN', 'I18n initialized');

        Backbone.Mediator.subscribe('spinner-on', function() {
            displaySpinner();
        });

        Backbone.Mediator.subscribe('spinner-off', function() {
            hideSpinner();
        });

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

        Backbone.Mediator.subscribe('conference-remove', function(model) {
            displayConfirmationPopup(model);
        });

        Backbone.Mediator.subscribe('conference-invite', function(model) {
            displayInvite(model);
        });

        Backbone.Mediator.subscribe('conference-edit', function(model) {
            displayEditor(model);
        });

        Backbone.Mediator.subscribe('about-terms', function() {
            var params = {'id': 'terms', 'outerBounds': { 'width': 500, 'height': 600, 'top': 100, 'left': 300}};
            chrome.app.window.create('terms.html', params);
        });
        
        Backbone.Mediator.subscribe('buddy-new', function(model) {
            buddies.add(model);
        });

        displayMainView();

        user.on('change:isConnected', function() {
            if(user.isConnected()) {
                settings.getGlobals();
                updateMeetingsList();
            }
        });

        user.signin();
    });

});