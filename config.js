function displayConfig(callback, context) {
	var login= document.querySelector('#openModal');
	login.classList.add('visible');

	var editor= document.querySelector('#list');
	editor.classList.add('blur');

	var loginField = document.querySelector('#login');
	var passwordField = document.querySelector('#password');
	var otField = document.querySelector('#ot');

	loginField.value = localStorage["lift_login"];
	passwordField.value = localStorage["lift_password"];
	otField.value = localStorage["lift_host"];

	var cancelSettingBtn = document.querySelector('.cancelSettingButton');

	cancelSettingBtn.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		hideConfig();
	};

	var loginButton = document.querySelector('.loginButton');

	loginButton.onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		localStorage["lift_login"] = loginField.value;
    	localStorage["lift_password"] = passwordField.value;
    	localStorage["lift_host"] = otField.value;
    	login_param = loginField.value;
    	password_param = passwordField.value;
    	host_param = otField.value;

    	hideConfig();
    	callback.call(context);
	};
};

hideConfig = function() {
	var login= document.querySelector('#openModal');
	login.classList.remove('visible');

	var editor= document.querySelector('#list');
	editor.classList.remove('blur');
};

