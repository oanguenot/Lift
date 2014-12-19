var ConfigView = Backbone.View.extend({
    initialize: function(){
        this.render();
    },
    render: function(){

        var that = this;

        $.get('./views/templates/config.tpl', function(template) {

            Mustache.parse(template);   // optional, speeds up future uses
            var rendered = Mustache.render(template);

            that.$el.html( rendered );
        });
    }
});