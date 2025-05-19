
let http = require('http');
let formidable = require('formidable');
let fs = require('fs');

http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
	let form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
	    let strangepath = files.filepath;
	    let newpath = '/home/brendanoconnor/nodeprojects' + files.filetoupload.originalFilename;
	    console.log("files " + files.filetoupload.path);
	    console.log("path " + strangepath);
	    console.log("type " + typeof strangepath);
	    fs.rename(strangepath, newpath, function (err) {
		if (err) throw err;
		res.write('File uploaded and moved!');
		res.end
	    });
	});
    } else {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
	res.write('<input type="file" name="filetoupload"><br>');
	res.write('<input type="submit">');
	res.write('</form>');
	return res.end();
    }
	
}).listen(8080);
