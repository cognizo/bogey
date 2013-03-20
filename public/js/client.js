$(document).ready(function() {

    var $iframe,
        $home = $('#home');

    function load(state) {
        if (state.action === 'home') {
            $home.show();
            visualize(state);
        } else {
            $home.hide();
            visualize(state);
        }
    }

    (function() {
        var state;
        if (window.location.hash) {
            state = {
                action: 'visualize',
                id: window.location.hash.substr(1)
            }
        } else {
            state = { action: 'home' }
        }
        history.replaceState(state, null, state.id ? '/#' + state.id : '');
        load(state);
    })();

    window.addEventListener('popstate', function(event) {
        // First load
        var state;
        if (event.state !== null) {
            load(event.state);
        }
    });

    $('#visualizations').on('click', 'li', function(event) {
        var data = $(event.currentTarget).data(),
            state = { action: 'visualize', id: data.id };
        history.pushState(state, data.title, '/#' + data.id);
        load(state);
    });

    function visualize(state) {
        if (state.action === 'home') {
            if ($iframe) {
                $iframe.remove();
                $iframe = null;
            }
        } else {
            $iframe = $('<iframe>')
                .on('load', function() {
                    $(this).show();
                })
                .attr('src', '/canvas/' + state.id)
                .appendTo('body');
        }
    }
});
