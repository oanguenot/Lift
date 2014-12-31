define('models/buddies', ['models/buddy'], function(BuddyModel) {

	"use strict";

	return Backbone.Collection.extend({
        
        model : BuddyModel,

        getABuddy: function(email) {
	    	return(this.find(function(model) { return model.get('id') === email; }));
	    }

    });

});
