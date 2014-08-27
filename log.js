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
	
function log_info(title, msg, arg) {
	trace('INFO', title, msg, arg);
}

function log_debug(title, msg, arg) {
	trace('DEBUG', title, msg, arg);
}

function log_warning(title, msg, arg) {
    trace('WARNING', title, msg, arg);
}

function log_error(title, msg, arg) {
	trace('ERROR', title, msg, arg);
}

