var express = require('express');
var app = express();
var server = app.listen(5000, function () {
  console.log('Listening on port %d', server.address().port);
});

var ejs = require('ejs');
var bodyParser = require('body-parser');
var exec = require("child_process").exec; // include exec module

var later = require("later");

var urls = [
  "www.ucla.edu",
  "www.cmu.edu",
  "www.nyu.edu/",
  "http://web.mit.edu/"
];
// Set up the view directory
app.set("views", __dirname);

// Set EJS as templating language WITH html as an extension)
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

app.get('/', function (req, res) {
  res.render('index');
});

// POST / api / users gets JSON bodies
app.post('/trace', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  trace(req, res);
});

// perform a traceroute:
function trace(req, res) {
  // get the name of the site to trace:
  var rawIPs = [];
  var pathname = req.body.siteName;
  // remove the leading /:
  while (pathname.charAt(0) === '/') {
    pathname = pathname.substr(1);
  }
  console.log("requested: " + pathname);
  console.log("Starting trace to " + pathname + "\n\n");
  // start the trace for real:
  var cmd = exec("traceroute " + pathname, function (error, stdout, stderr) {
    // on completion, close the connection to the client:
    console.log("\n\nTrace complete");
    //console.log(rawIPs);
    res.jsonp({
      IPs: rawIPs
    });
  });

  // when new data comes in from the trace,pass it to the client:
  cmd.stdout.on('data', function (data) {
    rawIPs.push(data);
    console.log(data);
  });
}

function test() {
  console.log(new Date());
}
var sched = later.parse.recur().first().second();
//var sched = later.parse.recur().first().minute();
//.startingOn('00:00');
var t = later.setInterval(test, sched);