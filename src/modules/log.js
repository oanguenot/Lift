define('modules/log', [], function() {

    var color = {
        "WARNING": "orange",
        "INFO": "darkgreen",
        "DEBUG": "blue",
        "ERROR": 'red'
    };

    var trace = function trace(cat, title, msg, arg) {
        var time = new Date(),
        ms = time.getMilliseconds();

        if(ms < 10) {
            ms = '00' + ms;
        } else if (ms < 100) {
            ms = '0' + ms;
        }

        var displaycat = title.substring(0, 12);
        while(displaycat.length < 12) {
            displaycat += ' ';
        }

        if(arg !== undefined) {
            console.log("%c|'O~O'| " + time.toLocaleTimeString() + ":" + ms + " [" + displaycat + "] - " + msg + " | %O", "color:" + color[cat], arg);
        }
        else {
         console.log("%c|'O~O'| " + time.toLocaleTimeString() + ":" + ms + " [" + displaycat + "] - " + msg, "color:" + color[cat]);   
        }
    };

    return {
        info: function(title, msg, arg) {
            trace('INFO', title, msg, arg);
        },

        debug: function(title, msg, arg) {
            trace('DEBUG', title, msg, arg);
        },

        warning: function(title, msg, arg) {
            trace('WARNING', title, msg, arg);
        },

        error: function(title, msg, arg) {
            trace('ERROR', title, msg, arg);
        }
    }

});
