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
	}

	return {

		load: function(callback, errCallback, context) {
			loadDataFromFile().then(function(data) {
				callback.call(context, data);
			}, function() {
				errCallback.call(context);
			});
		}

	};

});