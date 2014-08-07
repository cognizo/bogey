var $ = require('jquery');
var bogeyPong = require('/var/www/bogey-pong');
var bogeyWeb = require('/var/www/bogey-web');

$(document).ready(function () {
    window.App = bogeyWeb({
        container: '#bogey-web',
        demo: true,
        visualizations: [
            bogeyPong
        ]
    });
});
