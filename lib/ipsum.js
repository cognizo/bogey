
var normal = function() {
    var sum = 0;
    for (var i = 0; i < 12; i++) {
        sum = sum + Math.random();
    }
    return sum - 6;
};

var code = function() {
    var prob = Math.abs(normal());
    if (prob <= 1.75) {
        return 200;
    } else if (prob > 1.75 && prob < 2.5) {
        return 400;
    } else {
        return 500;
    }
};

var lorem = "Suspendisse lectus leo, consectetur in tempor sit amet, placerat quis neque. Etiam luctus porttitor lorem, sed suscipit est rutrum non. Curabitur lobortis nisl a enim congue semper. Aenean commodo ultrices imperdiet. Vestibulum ut justo vel sapien venenatis tincidunt. Phasellus eget dolor sit amet ipsum dapibus condimentum vitae quis lectus. Aliquam ut massa in turpis dapibus convallis. Praesent elit lacus, vestibulum at malesuada et, ornare et est. Ut augue nunc, sodales ut euismod non, adipiscing vitae orci. Mauris ut placerat justo. Mauris in ultricies enim. Quisque nec est eleifend nulla ultrices egestas quis ut quam. Donec sollicitudin lectus a mauris pulvinar id aliquam urna cursus. Cras quis ligula sem, vel elementum mi. Phasellus non ullamcorper urna.";

lorem = lorem.replace(/[\.,]/g, '').toLowerCase().split(' ');

var hostname = function() {
    var result = [];
    for (var i = 0; i < 6; i++) {
        var index = Math.round(Math.random() * lorem.length);
        result.push(lorem[index]);
    }
    return result.join('.');
}

var ip = function() {
    var result = [];
    for (var i = 0; i < 4; i++) {
        result.push(Math.round(255 * Math.random()));
    }
    return result.join('.');
};

var url = function () {
    var length = 1 + Math.round(3*Math.abs(normal()));
    var result = '/';
    for (var i = 0; i < length; i++) {
        var index = Math.round(Math.random() * lorem.length);
        result += lorem[index] + '/';
    }
    return result;
}


exports.tail = function(config, emit) {
    var time = 0, 
        amplitude = config.ipsum.amplitude || 15, 
        period = config.ipsum.period || 30;

    var timer = setInterval(function () {
        time++;
    }, 1000);

    var rate = function() {
        var rps = amplitude/2*Math.sin(Math.PI * time/(period/2)) + amplitude/2;

        // Add some noise.
        rps += 0.07*rps*Math.random() + -0.07*rps*Math.random();

        if (rps <= 1) {
            rps = 1;
        }

        return 1000 / Math.ceil(rps);
    };

    var loop = function() {
        emit( {
            'ipAddress': ip(),
            'hostname': hostname(),
            'url': url(),
            'statusCode': code()
        });
        setTimeout(loop, rate());
    };
    loop();
};
