var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var dir = './public/WDWEB';
var getfiles = "";



configenv = require('./env/env');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/WDWEB/index.html'));
});




if (configenv.envir === "development"){
    // https.createServer({
    //     key: fs.readFileSync('public/key.pem'),
    //     cert: fs.readFileSync('public/cert.pem')
    //     }, app).listen(configenv.port);
    fs.readdir(dir, function(err, files) {
        getfiles = files.length;
        console.log(files.length);
    });

    http.createServer(app).listen(configenv.port);
    console.log("Running app on localhost:" + configenv.port );
}

else{
    app.listen(process.env.PORT);
}
