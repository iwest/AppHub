(function() {
    var onNavApp = [];
    var onNavSection = [];
    var pending = {};
    var apps = {};

    var register = function(title, id) {
        $('.menu.appMenu').append(
            $('<li/>', {
                class: 'menu-text'
            }).append(
                $('<a/>', {
                    text: title,
                    href: '#' + id,
                    'data-close': ''
                })
            )
        );
    };

    var $apps = $('div[data-app]');
    for (var i = 0; i < $apps.length; i++) {
        var $app = $($apps[i])
        var id = $app[0].id.split('-')[1];
        register($app.data("app"), id);
    }

    var currentApp;
    var navigate = function(e) {
        var hashParts = window.location.hash.split('/');
        var route = hashParts[0].split('-');
        var navArgs = hashParts.splice(1);

        var appSelector;
        if (route[0]) {
            appSelector = '#app-' + route[0].substring(1);
        } else {
            appSelector = '.defaultApp';
        }
        var $app = $('body').find(appSelector);
        var app = $app[0].id.split('-')[1];

        if (app !== currentApp) {
            if (typeof(apps[app]) === 'undefined') {
                if ($app.data('iframe')) {
                    pending[app] = $.Deferred();
                    window.dynCore.iframe(app, $app.data('iframe')).done(
                        function(element) {
                            $(element).on('load', function() {
                                var links = this.contentWindow.document.getElementsByTagName('link');
                                for (var i = 0; i < links.length; i++) {
                                    if (links[i].getAttribute('rel') === 'icon') {
                                        this.contentWindow.favicon = links[i].getAttribute('href');
                                    }
                                }
                                pending[app].resolve(this.contentWindow);
                            });
                        }
                    );
                }
                window.dynCore.js(app);
                return;
            }

            for (var i = 0; i < onNavApp.length; i++) {
                onNavApp[i].call(this, app, route[1], navArgs);
            }

            currentApp = app;
            $('.app').hide();
            $app.show();

            window.dynCore.favicon(apps[app].favicon);
            $('title').text($app.data('app'));

            $('.appNav .menu-text a').removeClass('active');
            $('.appNav a[href="#' + app + '"]').addClass('active');
        }

        var section;
        if (route[1]) {
            section = '#' + app + '-' + route[1];
        } else {
            section = '.defaultSection';
        }

        var $section = $app.find(section);
        if ($section[0]) {
            for (var i = 0; i < onNavSection.length; i++) {
                onNavSection[i].call(this, app, route[1], navArgs);
            }
        }

        $app.find('.contentSection').hide();
        $section.show();
    };

    window.hashNav = {
        appInit: function(title, app) {
            apps[title] = app;
            $(document).foundation();
            this.rehash();
        },
        getPending: function(title) {
            return pending[title];
        },
        getApp: function(title) {
            return apps[title];
        },
        bindNavApp: function(fn) {
            onNavApp.push(fn);
        },
        unbindNavApp: function(fn) {
            onNavApp.splice(onNavApp.indexOf(fn), 1);
        },
        bindNavSection: function(fn) {
            onNavSection.push(fn);
        },
        unbindNavSection: function(fn) {
            onNavSection.splice(onNavSection.indexOf(fn), 1);
        },
        rehash: function() {
            navigate();
        }
    };

    $(window).on('hashchange', this.hashNav.rehash);

    window.hashNav.rehash();
})();