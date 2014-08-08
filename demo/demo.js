var $ = require('jquery');
var bogeyPong = require('bogey-pong');
var bogeyWeb = require('bogey-web');

$(document).ready(function () {
    window.App = bogeyWeb({
        container: '#bogey-web',
        demo: true,
        visualizations: [
            bogeyPong
        ]
    });
});
