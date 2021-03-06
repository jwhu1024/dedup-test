var http 	= require('http'),
	path 	= require('path'),
	os 		= require('os'),
	fs 		= require('fs'),
	util 	= require('util'),
	Busboy 	= require('busboy'),
	mkdirp 	= require("mkdirp"),
	history = new Array();

function key_search(_key, _cb) {
	var r = 0;
	history.forEach(function(element, index, arr) {
		if (element.toString() === _key) {
			r = 1;
		}
	});
	_cb(r);
}

function key_add(_key) {
	history.push(_key);
}

mkdirp("/tmp/uploads", function(err) { 
    // path exists unless there was an error
});

http.createServer(function (req, res) {
	var rsp = 0;
	if (req.method === 'POST') {
		var busboy = new Busboy({
			headers: req.headers
		});
		busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			file.pipe(fs.createWriteStream(path.join(os.tmpDir() + "/uploads/" + filename)));
			console.log("File \"" + path.join(os.tmpDir() + "/uploads/" + filename) + "\" " + "uploaded.");
		});
		busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
			var value = util.inspect(val);
			if (fieldname === "key") {
				key_search(util.inspect(val), function (isFound) {
					if (isFound == 0) {
						rsp = 1;
						key_add(value.toString());
					}
				});
			}
		});
		busboy.on('finish', function() {
			res.writeHead(200, {
				'Connection': 'close'
			});
			res.end(rsp.toString());
		});
		return req.pipe(busboy);
	}
	res.writeHead(404);
	res.end();
}).listen(3000, function() {
	console.log('Listening for requests on 3000 port');
});