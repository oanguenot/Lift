var win_left = 350,
    win_top = 100,
    win_width = 350,
    win_height = 650;

chrome.app.runtime.onLaunched.addListener(function() {

    chrome.app.window.create('popup.html', {'id': 'lift', 'outerBounds': { 'width': win_width, 'height': win_height, 'top': win_top, 'left': win_left}}, function() {
    }); 

});
