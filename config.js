function displayConfig(callback, context) {

    var configView = null;

    Backbone.Mediator.subscribe('settings-cancel', function() {
        configView.close();
        
        //TODO unblur
        //var editor= document.querySelector('#list');
        //editor.classList.remove('blur');
    });

    Backbone.Mediator.subscribe('settings-signin', function(settings) {
        configView.close();

        //TODO: Blur main view
        // var editor= document.querySelector('#list');
        // editor.classList.add('blur');

        login_param = settings.login;
        password_param = settings.password;
        host_param = settings.internal_server;

        callback.call(context);
    });

    configView = new ConfigView();
    $('#options-elt').append(configView.render().el);
}

function reload() {
    host_param = "";
    login_param = "";
    password_param = "";
}

function eraseFile() {
    // Return a new promise.
    return new Promise(function(resolve, reject) {

        window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

            // If file exists - Remote it
            fs.root.getFile('lift.config', {create: false}, function(fileEntry) {

                // Remove the file
                fileEntry.remove(function() { 

                    log_info("CONFIG", "User configuration deleted");

                    resolve();
                }, function(e) {
                    log_error("CONFIG", "Error: Can't remove file", e);
                    reject();
                });
                
            }, function() {
                log_error("CONFIG", "Warning: File doesn't exist");
                reject();
            });
        }, function(e) {
            log_error("CONFIG", "Error: Can't request file system", e);
            reject();
        });
    });
}




