var express = require('express');
var app = express();
var server = app.listen(5000, function () {
  console.log('Listening on port %d', server.address().port);
});

var ejs = require('ejs');
var bodyParser = require('body-parser');
var exec = require("child_process").exec; // include exec module

var later = require("later");

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
  //res.render('index');
  res.json({
    info: routes
  });
});

var urls = [
  "www.cmu.edu",
  "www.ucla.edu",
  "www.nyu.edu",
  "www.harvard.edu"
];
var urlsCounter = 0;

var routes = [];

// perform a traceroute:
function trace(_date, _index, _url) {
  // get the name of the site to trace:
  var _route = [];
  var info;
  var pathname = _url;
  var starCount = 0;
  // remove the leading /:
  while (pathname.charAt(0) === '/') {
    pathname = pathname.substr(1);
  }
  //console.log("requested: " + pathname);
  //console.log("Starting trace to " + pathname + "\n\n");
  // start the trace for real:
  var cmd = exec("traceroute " + pathname, function (error, stdout, stderr) {
    // on completion, close the connection to the client:
    //console.log("\n\nTrace complete");
    info = {
      date: _date,
      index: _index,
      route: _route
    };

    console.log(info);
    routes.push(info);
  });

  // when new data comes in from the trace,pass it to the client:
  cmd.stdout.on('data', function (data) {
    //console.log(data);
    var starPattern = /\*+/g;
    if (starPattern.exec(data) !== null) {
      starCount++;
      console.log(starCount);
      if (starCount > 2) {
        console.log("i gonna quit!");
        //cmd.kill("i gonna quit?!");
        return;
      }
    }
    var ip = getIP(data);
    if (ip !== undefined) {
      _route.push(ip);
      //console.log(ip);
    }
  });
}

function getIP(string) {
  //get (137.164.26.200)
  var pattern = /\(\S+\)/g;
  var ipWithParenthesis = pattern.exec(string);
  //console.log(ipWithParenthesis);
  if (ipWithParenthesis !== null) {
    //console.log(ipWithParenthesis[0]);
    //get 137.164.26.200
    var pattern2 = /[^\(\)]+/g;
    var ip = pattern2.exec(ipWithParenthesis);
    //console.log(ip);
    return ip[0];
  }
}

function traceAll(_date) {
  urls.forEach(function (url, index) {
    trace(_date, index, url);
  });
}

//traceAll(new Date());
trace(new Date(), 0, "www.nyu.edu");
var sched = later.parse.recur().first().second();
//var sched = later.parse.recur().first().minute();
// var t = later.setInterval(function () {
//   traceAll(new Date());
// }, sched);