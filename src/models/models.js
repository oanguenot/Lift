define('models/models', ['models/user', 'models/settings', 'models/conferences', 'models/buddies'], function(User, Settings, Conferences, Buddies) {

	"use strict";

	var userModel = new User(),
		settingsModel = new Settings(),
		conferencesCollection = new Conferences(),
		buddiesCollection = new Buddies();

	// Models factory
	return {
		user: function() {
			return userModel;
		},

		settings: function() {
			return settingsModel;
		},

		conferences: function() {
			return conferencesCollection;
		},

		buddies: function() {
			return buddiesCollection;
		}
	};
});