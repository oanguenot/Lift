# OpenTouch Meeting Manager (OTCMeeting): Schedule your Meetings

# Description

OpenTouch Meeting Manager (OTCMeeting) is a Chrome Application for scheduling Meetings for the Alcatel-Lucent Enterprise OpenTouch server.


## TODO
 - FEATURE: ICS Export


## TO CHECK
 - Once aborded, the only way to reopen the Event Pipe is to resign (signout/signin) to the application
 - Use Event Pipe quiet mode in order to not being visible by other user when using the application
 - WebView: to open a windows embedded OTC/Web


# HISTORY

## Version 1.5.8
 - FEATURE: Allow to configure an Audio password that is different than a Web password
 - FEATURE: Display Audio and Web passwords rules
 - FEATURE: Connection on WAN using external URL (try internal access and if not ok, external access) - To finalize
 - REFACTORING: Connection on LAN using REST API
 - FIX: Display specific popup when OT version is too old (< R2.1)
 - FIX: Display specific popup when the user has no right to create a new meeting
 - FIX: Display specific popup when the user has entered a bad password
 - FIX: English issues (labels, bad conference time when scheduling)

## Version 1.5.7
 - FIX: Production issue (missing icon 48x48)

## Version 1.5.6
 - FIX: Update icon used by chrome shortcut and icon used when there is no meeting

## Version 1.5.5
 - REFACTORING: New icon (thanks Alex!!!)

## Version 1.5.4
 - FIX: Missing Details.html file from production zip

## Version 1.5.3
 - REFACTORING: Switch from a meeting popup details to a meeting new window details with the ability to open several meetings at the same time
 - FEATURE: Display the rosters list (if exist using email don't resolve with buddy name) and the owner (resolve if possible)

## Version 1.5.2
 - FIX: Display email address when not a buddy (invited meetings)
 - REFACTORING: Change order in settings view (first URL, then login/password)
 - REFACTORING: Change naming: OTCMeeting and OpenTouch Meeting Manager (without s)

## Version 1.5.1
 - FIX: Display Reservationless duration availability
 - FEATURE: Differenciate bad credentials (login/password) from bad server/bad certificate cases by displaying specific message in each case

## Version 1.5
 - FEATURE: Allow to filter meetings (4 categories: Active, Not Begun, Ended and All)
 - FEATURE: Add languages management. (FR/US)
 - FEATURE: Allow to select text when displaying meetings information
 - REFACTORING: Use Backbone, Require, Jquery in order to have a MVC application (application fully rewritten)
 - FIX: Connect to ACS using quiet mode (no being visible by buddies)

## Version 1.4.2
 - FIX: Remove double scrollbars in terms windows on Windows

## Version 1.4.1
 - FIX: Production Issue

## Version 1.4.0
 - FEATURE: Display invitation meetings (thru event pipe)
 - REFACTORING: Change to a Chrome packaged app
 - REFACTORING: Don't use JavaScript eval() function to parse ACS Event Pipe data
 - FOSS: Update Moment.js to 2.8.2

## Version 1.3.2
 - FIX: Remove scrollbars when no need
 - FIX: Tests if global parameters exists before trying to use them
 - REFACTORING: Logs
 - PROD: Add grunt task to create the plugin zip file automatically

## Version 1.3.1
 - FIX: Production issue

## Version 1.3.0
 - FEATURE: Display an About box with the Copyright and License terms
 - FEATURE: Add a link to be able to reset cookies and data stored
 - REFACTORING: New Window management: Lift window is no more hidden when focus is lost. It's a real window that can be minized and kept open as a native window
 - REFACTORING: Rewrite all CSS in order to be responsive

## Version 1.2.2
 - FEATURE: Add audio link to details (Number to call)

## Version 1.2.1:
 - FIX: Issue with Webinar and Training profile that should not have a callback link
 - REFACTORING: Switch to OTC/PC icons for meeting action
 - REFACTORING: Add a new button to join the meeting when it's active 

## Version 1.2:
 - FEATURE: Allow to select the timezone 

## Version 1.1:
 - FEATURE: Allow to select the meeting profile: Meeting, Webinar, Training, Conference Call
 - FIX: Issue with meeting editor (end date not enabled when editing a scheduled with recurrence)

## Version 1.0.5:
 - FIX: Issue with bad end time (scheduled)
 - FEATURE: Leader Code
 - FEATURE: Display the password in the Conference Details panel
 - REFACTORING: Display Web Confirmation box instead of native one (should fix a bug on MAC)

## Version 1.0.4:
 - REFACTORING; Use File API instead of localstorage for storing the Login/Password
 - FIX: Issue "expires today" label that is still displayed when meeting is eneded
 - FIX: All lint issue
 - REFACTORING: Provide minified and obfuscated version

## Version 1.0.3:
 - REFACTORING: Use OTC clients graphical chart (font still roboto instead of clanOT)

## Version 1.0.2:
 - FIX: issue (replace HTTP protocol with HTTPS for the URL)

## Version 1.0 & 1.0.1:
 - REFACTORING: First released version on the Chrome Store
 - FIX: issue when re-scheduling a meeting (to have a new empty form without previous info)
 - FEATURE: Add placeholder icon

## Version 0.9-0.4:
 - REFACTORING: Merge the two extensions into a single one for listing, scheduling and modifying meetings
 - REFACTORING: Do not use 'logoff' and 'removeCookies' because it deconnects OTC/Web from its session
 - ...

## Version 0.3:
 - REFACTORING: Read timezone from vcs?settings=global
 - FIX: issue with notification. Only displayed if possible
 - FIX: issue with start time (use toLocaleTimeString() function instead of to JSONString() function)
 - FIX: issue with Date&Time not taken into account
 - FIX: issue with bard parameters sent to vcs_conf_schedule API

## Version 0.2:
 - REFACTORING: Version compliant to Chrome Extension

## Version 0.1:
 - FEATURE: First version
