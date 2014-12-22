var fs = require('fs');


var walk = function(dir, done) {
    /**
    Walk through the dir link provided, recursively and asyncronously
    **/
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                         results = results.concat(res);
                         if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};


// common video extensions
var ext_types = [
    'mpeg', 'mpg', 'mpe', 'm1s', 'mpa', 'mp2', 'm2a', 'mp2v', 'm2v', 'm2s',
    'avi','mov', 'qt', 'asf', 'asx', 'wmv', 'wma', 'wmx', 'rm', 'ra', 'ram',
    'rmvb', 'mp4', '3gp', 'ogm', 'mkv'
];


var callback = function (err, list) {
    /**
    Generally called when a file is encountered while walking
    **/
    if(err)
        throw err;

    for(var i = 0; i< list.length;i++) {
        item = list[i];

        var seperator_index = item.lastIndexOf('/');
        var name = item.slice(seperator_index+1);

        seperator_index = item.lastIndexOf('.');
        var ext = item.slice(seperator_index+1);

        if( ext_types.indexOf(ext) != -1 ) {
            movie_count += 1;
            console.log(name);
        }
    }
};


var prepare_movies = function(locations) {
    /**
    locations must be an array of absolute path(s) of movie directories
    **/
    movie_count = 0;
    for(var i = 0; i < locations.length; i++) {
        if(fs.existsSync(locations[i])) {
            walk(locations[i], callback);
        }
    }
};
