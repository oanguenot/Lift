/* ---------------------------------- About View ---------------------------------------- */

var MainView = Backbone.View.extend({

    itemName: 'div',

    className: 'modalDialog visible',

    id: 'aboutModal',

    initialize: function(){
    },

    events: {
        'click .aboutButton' : 'onAbout',
        'click #createBtn': 'onCreate',
        'click #settingBtn': 'onSettings',
    },

    render: function() {
        var template = $('#mainTpl').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var rendered = Mustache.render(template);

        this.$el.html(rendered);

        this.$('.mainScreen').i18n();

        return this;
    },

    close: function() {
        this.remove();
        this.undelegateEvents();
        this.unbind();
        this.off();
    },

    onAbout: function(e) {
        e.preventDefault();
        e.stopPropagation();
        Backbone.Mediator.publish('main-about', null);
    },

    onCreate: function(e) {
        e.preventDefault();
        e.stopPropagation();
        Backbone.Mediator.publish('main-meeting', null);
    },

    onSettings: function(e) {
        e.preventDefault();
        e.stopPropagation();
        Backbone.Mediator.publish('main-settings', null);
    }

});