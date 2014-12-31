define('models/buddy', [], function() {

    return Backbone.Model.extend({

        defaults: {
        },

        getDisplayName: function() {
        	var firstname = this.get('firstname'),
        		lastname = this.get('lastname'),
        		email = this.get('email');

        	if(firstname && firstname.length > 0 && lastname && lastname.length > 0) {
        		return this.get('firstname') + ' ' + this.get('lastname');
        	}

        	if(email && email.length > 0) {
        		return email;
			}

			return 'Someone on earth...';
	    }
    });
});