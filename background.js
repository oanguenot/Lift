var win_left = 350,
	win_top = 100,
	win_width = 350,
	win_height = 620,
	isOpened = false,
	windowID = '';

chrome.browserAction.onClicked.addListener(function() {
   
	if(!isOpened) {

		chrome.windows.create({'url': 'popup.html', 'type': 'panel', 'width': win_width, 'height': win_height, 'top': win_top, 'left': win_left}, function(window) {
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