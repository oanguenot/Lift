define('models/models', ['models/user', 'models/settings', 'models/conferences'], function(User, Settings, Conferences) {

	var userModel = new User(),
		settingsModel = new Settings(),
		conferencesModel = new Conferences();

	// Models factory
	return {
		user: function() {
			return userModel;
		},

		settings: function() {
			return settingsModel;
		},

		conferences: function() {
			return conferencesModel;
		}
	};
});