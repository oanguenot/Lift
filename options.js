/**
 * Copyright (C) <2013> <Alcatel-Lucent Enterprise>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * Save options to local storage
 */
function save_options() {

    localStorage["otc_scheduler_login"] = document.querySelector(".loginInput").value;
    localStorage["otc_scheduler_password"] = document.querySelector(".passwordInput").value;
    localStorage["otc_scheduler_host"] = document.querySelector(".hostInput").value;
    
    var notification = webkitNotifications.createNotification(
        'otc_48.png',  
        'OTC Conference Scheduler Options', 
        'Your parameters have been successfully saved. You can now schedule new conference!'
    );

    notification.show();
};

/**
 * Restore options from local storage
 */
 function restore_options() {
    var login = localStorage["otc_scheduler_login"];
    var password = localStorage["otc_scheduler_password"];
    var host = localStorage["otc_scheduler_host"];

    if(login) {
        document.querySelector(".loginInput").value = login;
    }

    if(password) {
        document.querySelector(".passwordInput").value = password;
    }

    if(host) {
        document.querySelector(".hostInput").value = host;
    }
};

/**
 * Initialize
 */
function init() {
    var btn = document.querySelector(".saveButton") ;     
    btn.addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        save_options();
    });
    restore_options();
};

/* ------------------------------------------ ON LOAD ---------------------------------------------- */

/**
 * When page is loaded, start the options
 */
document.addEventListener('DOMContentLoaded', function () {
  init();
});

