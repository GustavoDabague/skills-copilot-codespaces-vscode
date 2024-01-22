// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var formidable = require('formidable');
var util = require('util');
var comments = require('./comments.js');
var querystring = require('querystring');

http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var form = new formidable.IncomingForm();

    if (req.method === 'POST') {
        if (uri === '/submit') {
            form.parse(req, function(err, fields, files) {
                res.writeHead(200, {
                    'content-type': 'text/plain'
                });
                res.write('received the data:\n\n');
                res.end(util.inspect({
                    fields: fields,
                    files: files
                }));
                comments.addComment(fields.comment);
            });
            return;
        }
    }

    if (uri === '/comments') {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end(comments.getComments());
        return;
    }

    if (uri === '/submit') {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end('<form action="/submit" method="post"><input type="text" name="comment"><input type="submit" value="Submit"></form>');
        return;
    }

    fs.exists(filename, function(exists) {
        if (!exists) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not Found\n');
            res.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.write(err + '\n');
                res.end();
                return;
            }

            res.writeHead(200);
            res.write(file, 'binary');
            res.end();
        });
    });
}).listen(8080);
console.log('Server running at http://localhost:8080/');