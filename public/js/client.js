$(document).ready(function() {

    var $iframe,
        $home = $('#home'),
        homeState = { action: 'home' };

    function load(state) {
        if (state.action === 'home') {
            $home.removeClass('hidden');
            visualize(state);
        } else {
            $home.addClass('hidden');
            visualize(state);
        }
    }

    // Closes the current visualizations
    function home() {
        history.pushState(homeState, null, '/#home');
        load(homeState);
    }

    $(window).on('hashchange', function() {
        var state;
        if (window.location.hash && window.location.hash !== '#home') {
            state = {
                action: 'visualize',
                id: window.location.hash.substr(1)
            }
        } else {
            state = homeState;
        }
        history.replaceState(state, null, state.id ? '/#' + state.id : '/#home');
        load(state);
    }).triggerHandler('hashchange');

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
                $iframe.get(0).contentWindow.Bogey.closeSocket();
                $iframe.contents().find('canvas')
                    .addClass('hidden')
                    .on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
                        $iframe.remove();
                    });
            }
        } else {
            $iframe = $('<iframe>')
                .on('load', function() {
                    $iframe.show().contents().find('canvas').removeClass('hidden');
                    setTimeout(function() {
                        var contentWindow = $iframe.get(0).contentWindow;
                        contentWindow.Bogey.onClose(home);
                        $(contentWindow).focus(); // For key events
                    }, 0); // Next tick for Firefox
                })
                .attr('src', '/canvas/' + state.id)
                .appendTo('body');
        }
    }
});
