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

hideConfig = function() {
    var login= document.querySelector('#openModal');
    login.classList.remove('visible');

    var editor= document.querySelector('#list');
    editor.classList.remove('blur');
}

saveDataToFile = function(l, p, h) {

    // Return a new promise.
    return new Promise(function(resolve, reject) {
        window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

            fs.root.getFile('lift.config', {create: false}, function(fileEntry) {

                console.log("fileEntry", fileEntry);

                fileEntry.remove(function() {

                    fs.root.getFile('lift.config', {create: true}, function(fileEntry) {
                    
                        fileEntry.createWriter(function(fileWriter) {

                            fileWriter.seek(0);

                            var blob = new Blob([l + '&|&' + p + '&|&' + h], {type: 'text/plain'});

                            fileWriter.write(blob);

                            resolve();

                        }, function() {
                            reject();
                        });

                    }, function() {
                        reject();
                    }); 

                }, function() {
                    reject();
                });
                
            }, function() {
                reject();
            });
        }, function() {
            reject();
        });

    });
    
}

errorHandler = function(err) {
    console.log("FileSystem error", err);
}

loadDataFromFile = function() {

    // Return a new promise.
    return new Promise(function(resolve, reject) {

        window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

            fs.root.getFile('lift.config', {}, function(fileEntry) {

                fileEntry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function(e) { 

                        var data = this.result.split('&|&');

                        resolve({
                            login: data[0], 
                            password: data[1], 
                            host: data[2]
                        })
                    } 

                    reader.readAsText(file);
                    
                }, function(e) {
                    reject(e);
                })

            }, function(e) {
                reject(e);
            });
        }, function(e) {
            reject(e);
        });

    });

    
}

