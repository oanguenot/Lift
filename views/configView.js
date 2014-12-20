
function loadDataFromFile() {

    log_info("CONFIG", "Load user data...");

    // Return a new promise.
    return new Promise(function(resolve, reject) {

        window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

            fs.root.getFile('lift.config', {}, function(fileEntry) {

                fileEntry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function() {

                        log_info("CONFIG", "User configuration found!"); 

                        var data = this.result.split('&|&');

                        resolve({
                            login: data[0], 
                            password: data[1], 
                            host: data[2]
                        });
                    }; 

                    reader.readAsText(file);
                    
                }, function(e) {
                    log_error("CONFIG", "Error: Can't get file entry", e);
                    reject(e);
                });

            }, function(e) {
                log_error("CONFIG", "Error: Can't get file", e);
                reject(e);
            });
        }, function(e) {
            log_error("CONFIG", "Error: Can't request file system", e);
            reject(e);
        });
    });
}

function saveDataToFile(l, p, h) {

    log_debug("CONFIG", "Save user configuration", {login: l, password: '****', host: h});

    // Return a new promise.
    return new Promise(function(resolve, reject) {

        var blob = new Blob([l + '&|&' + p + '&|&' + h], {type: 'text/plain'});

        window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

            // If file exists - Remote it
            fs.root.getFile('lift.config', {create: false}, function(fileEntry) {

                // Remove the file
                fileEntry.remove(function() {

                    // Create a new one
                    fs.root.getFile('lift.config', {create: true}, function(fileEntry) {
                    
                        // Create the writer
                        fileEntry.createWriter(function(fileWriter) {

                            fileWriter.seek(0);

                            fileWriter.write(blob);

                            log_info("CONFIG", "User configuration successfully saved");

                            resolve();

                        }, function(e) {
                            log_error("CONFIG", "Error: Can't create a writer", e);
                            reject();
                        });

                    }, function(e) {
                        log_error("CONFIG", "Error: Can't create a new file", e);
                        reject();
                    }); 

                }, function(e) {
                    log_error("CONFIG", "Error: Can't remove the file", e);
                    reject();
                });
                
            }, function() {
                // File doesn't exist - Create and save a new one
                fs.root.getFile('lift.config', {create: true}, function(fileEntry) {
                    
                    log_info("CONFIG", "No previous user configuration, create new");

                    // Create the writer
                    fileEntry.createWriter(function(fileWriter) {

                        fileWriter.seek(0);

                        fileWriter.write(blob);

                        log_info("CONFIG", "User configuration successfully saved");

                        resolve();

                    }, function(e) {
                        log_error("CONFIG", "Error: Can't create a writer", e);
                        reject();
                    });

                }, function(e) {
                    log_error("CONFIG", "Error: Can't create a new file", e);
                    reject();
                });
            });
        }, function(e) {
            log_error("CONFIG", "Error: Can't request file system", e);
            reject();
        });
    });
}

/* ---------------------------------- Config View ---------------------------------------- */

var ConfigView = Backbone.View.extend({

    itemName: 'div',

    className: 'modalDialog visible',

    id: 'openModal',

    initialize: function(){
    },

    events: {
        'click .cancelSettingButton' : 'onCancelSignin',
        'click .loginButton': 'onSignin'
    },

    render: function() {
        var that = this;

        var template = $('#settingsTpl').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var rendered = Mustache.render(template);

        this.$el.html(rendered);

        this.$('.popupSettings').i18n();

        //Read data from file
        loadDataFromFile().then(function(data) {
            that.$('#login').val(data.login || "");
            that.$('#password').val(data.password || "");
            that.$('#ot').val(data.host || "");
        }, function() {
            that.$('#login').val("");
            that.$('#password').val("");
            that.$('#ot').val("");
        });

        return this;
    },

    close: function() {
        this.remove();
        this.undelegateEvents();
        this.unbind();
        this.off();
    },

    onCancelSignin: function(e) {
        e.preventDefault();
        e.stopPropagation();
        Backbone.Mediator.publish('settings-cancel', null);
    },

    onSignin: function(e) {
        e.preventDefault();
        e.stopPropagation();  

        var signin = {
            login: this.$('#login').val(),
            password: this.$('#password').val(),
            internal_server: this.$('#ot').val()
        };

        saveDataToFile(signin.login, signin.password, signin.internal_server);

        Backbone.Mediator.pulish('settings-signin', signin);
    }
});