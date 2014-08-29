/** 
 * Manage cookies
 * Be sure that each time the user opens the extension, there is no old cookies in the navigator
 * From the same domain
 * - Try to delete cookes using traditional way (seems not to work)
 * - Try to use Chrome Extension API: chrome.cookies
 */

/**
 * Create cookie
 * @param {String} name The name of the cookie
 * @param {String} value The value to set
 * @param {Number} days The expiration duration in days
 */

// function createCookie(name,value,days) {
//     try {
//         var expires;
//         if (days) {
//             var date = new Date();
//             date.setTime(date.getTime()+(days*24*60*60*1000));
//             expires = "; expires="+date.toGMTString();
//         }
//         else {
//             expires = "";
//         }
//         document.cookie = name+"="+value+expires+"; path=/";
//     } catch (err) {
//         console.log("error create cookie:" + err);
//     }
// }

/**
 * Read cookie
 * @param {String} name The name of the cookie
 */

// function readCookie(name) {
//     try {
//         var nameEQ = name + "=";
//         var ca = document.cookie.split(';');
//         for(var i=0;i < ca.length;i++) {
//             var c = ca[i];
//             while (c.charAt(0) === ' ') {
//                 c = c.substring(1,c.length);
//             }
//             if (c.indexOf(nameEQ) === 0) {
//                 return c.substring(nameEQ.length,c.length);
//             }
//         }
//         return null;
//     } catch (err) {
//         console.log("error read cookie:" + err);
//     }
// }

/**
 * Delete cookie
 * @param {String} The name of the cookie to delete
 */
 
// function eraseCookie(name) {
//     try {
//         var value = readCookie(name);
//         if (value) {
//             createCookie(name, value, -1);
//             return true;
//         }
//         return false;
//     } catch (err) {
//         console.log("error erase cookie:" + err);
//     }
// }

/**
 * Delete all created cookies
 * Found and delete all cookies from a host using chrome extension API chrome.cookies
 * Asynchronous function: use Promise to get result
 * BE CAREFULL = DON't BE USED BECAUSE IT DECONNECTS OTC/WEB FROM ITS CURRENT SESSION 
 * IF ON THE SAME SERVER
 */

function deletePreviouslyUsedCookies() {

    // Return a new promise.
    return new Promise(function(resolve, reject) {

        log_info("COOKIES", "Try to delete all used cookies...");

        try {
            
            //log_debug("COOKIES", "Delete all created cookies");
            //eraseCookie("s_fid");
            //eraseCookie("AlcUserId");
            //eraseCookie("OTUCSSO");
            //eraseCookie("ed_client_tag.");
            //eraseCookie("ics.login.0.");
            //eraseCookie("ics.login.1.");
            //eraseCookie("ics.login.2.");
            //eraseCookie("edial_vcs2.login");
            //eraseCookie("edial_vcs2.login_persistent");
            //eraseCookie("ed_client_guid.");
            //eraseCookie("edial_vcs2.remember_pw");
            //eraseCookie("ed_usernum");

            
            log_debug("COOKIES", "On host", host_param);

            var domain = host_param.substring(host_param.indexOf('.') +1);
            log_debug("COOKIES", "For domain", domain);

            // chrome.cookies.getAll({domain: domain}, function(cookies) {
            //     var cookieNb = cookies.length;
            //     var cookieDeleted = 0;

            //     log_debug("COOKIES", "Found", {nbCookies: cookieNb, cookies: cookies});

            //     if(cookieNb > 0) {
            //         for(var i=0; i<cookies.length;i++) {
            //             log_debug("COOKIES", "Delete...", cookies[i].name);
            //             chrome.cookies.remove({url: "http://" + host_param + cookies[i].path, name: cookies[i].name}, function(details) {
            //                 log_debug("COOKIES", "Deleted", details.name);
            //                 cookieDeleted++;
            //                 if(cookieDeleted === cookieNb) {
            //                     log_info("COOKIES", "All cookie have been successfully deleted");
            //                     resolve();
            //                 }
            //             });
            //         }
            //     }
            //     else {
            //         log_warning("COOKIES", "No cookie found, so nothing to delete");
            //         resolve();
            //     }
                
            // });
            resolve();
        }
        catch(error) {
            log_error("COOKIES", "deletePreviouslyUsedCookies", error);
            reject(error);
        }
    });     
}

/**
 * Listener on cookies change
 */

// chrome.cookies.onChanged.addListener(function(info) {
//     console.log("onChanged", info);
// });
