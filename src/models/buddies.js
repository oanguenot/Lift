define('models/buddies', ['models/buddy'], function(BuddyModel) {

	return Backbone.Collection.extend({
        
        model : BuddyModel,

        getABuddy: function(email) {
	    	return(this.find(function(model) { return model.get('id') === email; }));
	    }

    });

});
