function displayConfig(callback, context) {
    var login= document.querySelector('#openModal');
    login.classList.add('visible');

    var editor= document.querySelector('#list');
    editor.classList.add('blur');

    var loginField = document.querySelector('#login');
    var passwordField = document.querySelector('#password');
    var otField = document.querySelector('#ot');

    //Read data from file
    loadDataFromFile().then(function(data) {

        loginField.value = data.login || "";
        passwordField.value = data.password || "";
        otField.value = data.host || "";
    }, function() {
        loginField.value = "";
        passwordField.value = "";
        otField.value = "";
    });

    var cancelSettingBtn = document.querySelector('.cancelSettingButton');

    cancelSettingBtn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        hideConfig();
    };

    var loginButton = document.querySelector('.loginButton');

    loginButton.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        //localStorage["lift_login"] = loginField.value;
        //localStorage["lift_password"] = passwordField.value;
        //localStorage["lift_host"] = otField.value;
        login_param = loginField.value;
        password_param = passwordField.value;
        host_param = otField.value;

        saveDataToFile(login_param, password_param, host_param).then(function() {
            hideConfig();
            callback.call(context); 
        }, function() {
            //LIFT can't be used
        });
    };
}

function hideConfig() {
    var login= document.querySelector('#openModal');
    login.classList.remove('visible');

    var editor= document.querySelector('#list');
    editor.classList.remove('blur');
}

function reload() {
    host_param = "";
    login_param = "";
    password_param = "";
    window.location.reload(true);    
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

