# Bogey

Bogey is a web-based log visualization framework.

It tails your log files and emits events using [Socket.IO](http://socket.io/) to browser visualization plugins.

Bogey ships with [Bogey Pong](https://github.com/cognizo/bogey-pong), a Pong-like visualization
inspired by [Logstalgia](https://code.google.com/p/logstalgia/) that works with common web server
logs, but it's designed to make it easy to plug in your own visualizations.

## Installing

Bogey is a [Node.js](http://nodejs.org/) module.

Install with `npm`:

    npm install -g bogey

## Details

Bogey's Node.js module runs a server that watches any number of log files, parses them with a
configurable regular expression, and emits the processed data to connected clients via [Socket.IO](http://socket.io/).

The [web frontend](https://github.com/cognizo/bogey-web) is an [Ember](http://emberjs.com/) application that
listens for log events and provides an API to visualization modules that can display the log data
however they want.

Creating a visualization is easy, since all you need to do is expose a JavaScript module that Bogey
can `require()`, hook into Bogey's events, and render the data however you want.

Bogey provides modules with a render loop, simple stats (requests per minute, etc) and keyboard events,
but doesn't enforce anything about how to render log data.

For a basic example of how a visualization module works, check out
[Bogey Example](https://github.com/cognizo/bogey-example). You can also check out the code for
[Bogey Pong](https://github.com/cognizo/bogey-pong), which uses the [Phaser](http://phaser.io/) HTML5
game framework.

## Usage

Run Bogey with the `bogey` command.

### Options

    -c <config file> Config file

Specify a JSON config file to load for configuration settings. This setting is optional.

See `config.json.example` for an example configuration.

    -f <filename:regexp name> Watch a file

Watch a file. Specify the file in the format `filename:regexp-name`. Bogey comes with a regular expression
for parsing files in the [Common Log Format](http://en.wikipedia.org/wiki/Common_Log_Format), but it's
easy to add your own. See the [regular expressions](#regular-expressions) section for details. This
setting is optional, but if no logs are specified only [demo mode](#demo-mode) will be available.

    -p <port> Port

Port for the web server to listen on.

### Usage examples

Tail an Nginx or Apache access log:

    bogey -f /var/log/nginx/access.log:apache-combined

Tail multiple files:

    bogey -f /var/log/nginx/access.log:apache-combined -f /var/www/my-site/logs/access.log:apache-combined

### Regular expressions

Bogey uses regular expressions to parse log files into data that modules can use. It uses the
[named-regexp](https://www.npmjs.org/package/named-regexp) module to allow for using named
captures with JavaScript regular expressions.

Bogey comes with the `apache-combined` regular expression, but it's easy to add your own. Just add a
section to your `config.json`:

    "regexp": {
        "my-regexp": "/(:<myAttr>.*) (:<myOtherAttr>.*)/"
    }

And then specify it either on the command line with `-f` like:

    bogey -f /var/log/my-custom.log:my-regexp

Or in your `config.json` like:

    "logs": [
        {
            "file": "/var/log/my-custom.log",
            "regexp": "my-regexp"
        }
    ]

Check the [named-regexp documentation](https://www.npmjs.org/package/named-regexp) for details on the
named capture syntax.

## Using with Logstash

If you're using Logstash, Bogey supports receiving log data via HTTP POST.

Just enable the [http output](http://logstash.net/docs/latest/outputs/http) and map the data so that
Bogey understands it.

Here's an example Logstash configuration using the COMBINEDAPACHELOG grok filter:

    output {
        http {
            http_method => "post"
            mapping => {
                "ip" => "%{clientip}"
                "uri" => "%{request}"
                "statusCode" => "%{response}"
            }
            url => "http://bogey-host:8008/log"
        }
    }

## Demo mode

Bogey comes with a demo mode that runs in the browser and creates fake log data. You can enable it by
appending `?demo=true` to the URL when viewing a visualization, or by pressing the `D` key.

## Creating visualizations

Visualizations are CommonJS modules `require()`ed by the Bogey web frontend.

A visualization should export a `bogey` object with the following properties:

    bogey: {
        name: 'Visualization name',
        thumbnail: 'Path to thumbnail image',
        run: function (bogey) {
            // Run the visualization
        }
    }

The `bogey` object passed to a module's `bogey.run()` emits the following events:

        bogey.on('request', function (data) {
            // Passes an object with parsed data from a log line.
        });

        bogey.on('frame', function () {
            // A new frame is ready for rendering. If you use Bogey's render loop, this your
            // main update function.
        });

        bogey.on('pause', function () {
            // The visualization has been paused (Space key pressed).
        });

        bogey.on('play', function () {
            // The visualization has been unpaused (Space key pressed while paused).
        });

        bogey.on('speedUp', function () {
            // The visualization has been sped up (+ key pressed).
        });

        bogey.on('slowDown', function () {
            // The visualization has been slowed down (- key pressed).
        });

        bogey.on('defaultSpeed', function () {
            // The visualization has been reset to normal speed (0 key pressed).
        });

        bogey.on('resize', function () {
            // The visualization window has been resized.
        });

        bogey.on('close', function () {
            // The visualization has been closed (Escape or Q key pressed).
        });

Note that in the case of `pause`, `play`, `speedUp`, `slowDown`, `defaultSpeed` and `resize`, it is up to the
visualization module to act on each of these requests.

You also don't have to use Bogey's render loop. If you choose to use a different engine, you can ignore
the `frame` event and implement your own. For example, the [bogey-pong](https://github.com/cognizo/bogey-pong)
module uses the [Phaser](http://phaser.io/) engine which has its own render loop.

### Visualization development

Since Bogey expects visualizations to be CommonJS modules, it comes with build scripts that will automatically
[Browserify](http://browserify.org/) your modules and include them in Bogey.

While developing a visualization, you'll need to run the development version of Bogey.

Check out the repository:

    git clone https://github.com/cognizo/bogey.git

Install its dependencies:

    cd bogey
    npm install

To include a visualization module, add a `visualizations` section to your `config.json` like:

    "visualizations": [
        "my-module" // "my-module" should be an npm module that Bogey can require()
    ]

Then run:

    gulp build

This will build your visualization and include it in the web frontend's configuration.

You can also run a development server that will automatically rebuild your visualizations any time
they change with:

    gulp serve
