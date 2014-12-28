# OpenTouch Meetings Manager (OTCMeetings): Schedule your Meetings

## Description

Download this extension from the Chrome store
Use your OpenTouch credentials


# TODO
 - FEATURE: Set password rules
 - FEATURE: ICS Export

# HISTORY

## Version 1.5 - In progress
 - REFACTORING: Use Backbone, Require, Jquery in order to have a MVC application
 - FEATURE: Add languages management (FR/US)
 - FEATURE: Allow to select text when displaying meetings information

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
