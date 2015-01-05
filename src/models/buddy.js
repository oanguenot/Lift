define('models/buddy', [], function() {

    "use strict";

    return Backbone.Model.extend({

        defaults: {
        },

        getDisplayName: function() {
            var firstname = this.get('firstName'),
                lastname = this.get('name'),
                email = this.get('email');

            if(firstname && firstname.length > 0 && lastname && lastname.length > 0) {
                return this.get('firstName') + ' ' + this.get('name');
            }

            if(email && email.length > 0) {
                return email;
            }

            return 'Someone on earth...';
        }
    });
});