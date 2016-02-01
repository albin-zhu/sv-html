var cheerio = require('cheerio');
var urllib = require('urllib');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var mkdirp = Q.denodeify(require('mkdirp'));
var write = Q.denodeify(fs.writeFile);

(function() {
    var host = "";
    var url = "";
    var protocol = "http://";
    var sync_dir = "";
    var save_path = "";
    var exp = {};
    module.exports = exp;

    exp.sync = function(u, dir) {
        // var results = u.match(/^(http[s]:\/\/)([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?$/);
        // protocol = results[1] || protocol;
        // host = results[2] || host;
        sync_dir = dir;
        url = u;
        save_file(u);
    }

    function save_file(file) {
        var req = "";
        if(file.indexOf(url) >= 0) {
            req = file;
            file = file.substring(url.length);
            if(file.length == 0) {
                file = "index.html";
            }
        }
        else {
            req = url + file;
        }
        var file_path = path.join(sync_dir, file);
        var base_name = path.basename(file);
        mkdirp(path.dirname(file_path))
            .then(function() {
                return urllib.request(req);
            })
            .then(function(data) {
                if(path.extname(file) == ".html") {
                    var $ = cheerio.load(data.data);
                    $("script").each(function(){
                        var code = $(this);
                        var src = code.attr("src");
                        console.log(src);
                        if(src && src.indexOf('http') == -1 && src.indexOf('//') == -1) {
                            save_file(src);
                        }
                    });
                    $('link').each(function(){
                        var code = $(this);
                        var src = code.attr("href");
                        console.log(src);
                        if(src && src.indexOf('http') == -1  && src.indexOf('//') == -1) {
                            save_file(src);
                        }
                    });
                }
                return write(file_path, data.data);
            })
            .catch(function(err) {
                console.log(err);
            });
        ;
    }


})();
