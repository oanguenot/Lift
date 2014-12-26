define('modules/credentials', ['modules/log'], function(log) {

    var loadDataFromFile = function loadDataFromFile() {

        log.info("CONFIG", "Load user data...");

        // Return a new promise.
        return new Promise(function(resolve, reject) {

            window.webkitRequestFileSystem(window.PERSISTENT, 100*1024, function(fs){

                fs.root.getFile('lift.config', {}, function(fileEntry) {

                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onloadend = function() {

                            log.info("CONFIG", "User configuration found!"); 

                            var data = this.result.split('&|&');

                            resolve({
                                login: data[0], 
                                password: data[1], 
                                host: data[2]
                            });
                        }; 

                        reader.readAsText(file);
                        
                    }, function(e) {
                        log.error("CONFIG", "Error: Can't get file entry", e);
                        reject(e);
                    });

                }, function(e) {
                    log.error("CONFIG", "Error: Can't get file", e);
                    reject(e);
                });
            }, function(e) {
                log.error("CONFIG", "Error: Can't request file system", e);
                reject(e);
            });
        });
    };

    var saveDataToFile = function saveDataToFile(l, p, h) {

        log.debug("CONFIG", "Save user configuration", {login: l, password: '****', host: h});

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

                                log.info("CONFIG", "User configuration successfully saved");

                                resolve();

                            }, function(e) {
                                log.error("CONFIG", "Error: Can't create a writer", e);
                                reject();
                            });

                        }, function(e) {
                            log.error("CONFIG", "Error: Can't create a new file", e);
                            reject();
                        }); 

                    }, function(e) {
                        log.error("CONFIG", "Error: Can't remove the file", e);
                        reject();
                    });
                    
                }, function() {
                    // File doesn't exist - Create and save a new one
                    fs.root.getFile('lift.config', {create: true}, function(fileEntry) {
                        
                        log.info("CONFIG", "No previous user configuration, create new");

                        // Create the writer
                        fileEntry.createWriter(function(fileWriter) {

                            fileWriter.seek(0);

                            fileWriter.write(blob);

                            log.info("CONFIG", "User configuration successfully saved");

                            resolve();

                        }, function(e) {
                            log.error("CONFIG", "Error: Can't create a writer", e);
                            reject();
                        });

                    }, function(e) {
                        log.error("CONFIG", "Error: Can't create a new file", e);
                        reject();
                    });
                });
            }, function(e) {
                log.error("CONFIG", "Error: Can't request file system", e);
                reject();
            });
        });
    };

    return {

        load: function(callback, errCallback, context) {
            loadDataFromFile().then(function(data) {
                callback.call(context, data);
            }, function() {
                errCallback.call(context);
            });
        },

        save: function(login, password, host, callback, errCallback, context) {
            saveDataToFile(login, password, host).then(function() {
                callback.call(context);
            }, function() {
                errCallback.call(context);
            });
        }
    };

});