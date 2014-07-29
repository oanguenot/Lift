var left = 0;
var top = 0;

var width = 350;
var height = 620;

var isOpened = false;

var windowID = '';

chrome.browserAction.onClicked.addListener(function() {
   
	if(!isOpened) {

		chrome.windows.create({'url': 'popup.html', 'type': 'panel', 'width': width, 'height': height, top: 100, left: 350}, function(window) {
			windowID = window.id;
			isOpened = true;	
		});	
	}
	else {
		chrome.windows.update(windowID, {
			focused: true,
			drawAttention: true
		});
	}
	
});

chrome.windows.onRemoved.addListener(function(id) {
	if(id === windowID) {
		isOpened = false;
	}
});