var $ = require('jquery');
var bogeyWeb = require('/var/www/bogey-web');

$(document).ready(function () {
    $.getJSON('/config.json', function (config) {
        window.App = bogeyWeb({
            container: '#bogey-web',
            visualizations: config.visualizations
        });
    });
});
