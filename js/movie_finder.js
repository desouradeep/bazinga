var fs = require('fs');
var shell = require('shelljs');

var guessit = require('guessit-wrapper');


var walk = function(dir, done) {
    /**
    Recursive serial walk through dir
    **/
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                });
                } else {
                        results.push(file);
                        next();
                }
            });
        })();
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
            parse(name);
        }
    }
};

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var movies = [];

var parse_count = 0;
var parse = function(filename) {
    /**
    Parses basic info about movies from their names. This is required to
    identify the movie on imdb
    **/
    guessit.parseName(filename).then(function (data) {
        parse_count += 1;
        var title = replaceAll(' ', '+', data.title);
        var request = $.ajax({
            url: 'http://www.omdbapi.com',
            type: "GET",
            data: {
                t: title,
                y: data.year,
                r: 'json'
            }
        });

        request.done(function(data) {
            try {
                movie_json = JSON.parse(data);
            }
            catch(err) {
                console.log(err);
            }

            debugger;
            if(movie_json.Response == "True") {
                var movies_tbody = $("#movies-tbody");
                var table_row = "\
                    <tr> \
                        <td>" + movie_json.Title + "</td> \
                        <td>" + movie_json.Year + "</td> \
                        <td>" + movie_json.imdbRating + "</td> \
                        <td>" + movie_json.Genre + "</td> \
                        <td>" + movie_json.Runtime + "</td> \
                    </tr>";
                console.log(table_row);
                movies_tbody.append(table_row);
                movies.push(data);
            }
        });

        movies_dict.push(data);
    });
};


var prepare_movies = function(locations) {
    /**
    locations must be an array of absolute path(s) of movie directories
    **/
    movie_count = 0;
    movies_dict = [];
    for(var i = 0; i < locations.length; i++) {
        if(fs.existsSync(locations[i])) {
            walk(locations[i], callback);
        }
    }
};
