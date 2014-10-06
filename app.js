var express = require('express');
var app = express();
var server = app.listen(5000, function () {
  console.log('Listening on port %d', server.address().port);
});

var ejs = require('ejs');
var bodyParser = require('body-parser');
var cp = require('child_process'); // include exec module
var later = require('later');
var fs = require("fs");
var urllib = require('urllib');

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
  res.json({
    "universities": universities
  });
});

var urls = [
  "www.cmu.edu",
  "www.mit.edu",
  "www.google.com"
];

var universities = [];

function trace(_date, _time, _index, _url, callback) {
  var pathname = _url;
  var _route = [];
  var info;
  cp.exec("traceroute " + pathname, {
    setTimeout: 5 * 60 * 1000
  }, function (err, stdout, stderr) {
    if (err) {
      return callback(err);
    }
    var out = stdout.split('\n');
    out.forEach(function (o) {
      var ip = getIP(o);
      if (ip !== undefined) {
        _route.push(ip);
      }
    });
    getLocationAll(_route, function (err, locations) {
      info = {
        "index": _index,
        "date": _date,
        "time": _time,
        "locs": locations
      };
      universities.push(info);
      callback(null, info);
    });

  });

}

function getIP(str) {
  var pattern = /\(\S+\)/g;
  var ipWithParenthesis = pattern.exec(str);
  if (ipWithParenthesis !== null) {
    var pattern2 = /[^\(\)]+/g;
    var ip = pattern2.exec(ipWithParenthesis);
    return ip[0];
  }
}

function traceAll(urls, _date, _time, callback) {
  urls.forEach(function (_url, _index) {
    trace(_date, _time, _index, _url, callback);
  });
}

function getLocation(ip, callback) {
  urllib.request('http://ipinfo.io/' + ip + "/json", {
    method: 'GET',
    dataType: 'json'
  }, function (err, data, res) {
    if (err) {
      return console.error(err.stack);
    }
    var str = data.loc;
    var result = str.split(",");
    var lat = parseFloat(result[0]);
    var lng = parseFloat(result[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      var location = [lat, lng];
      callback(err, location);
    } else {
      callback(err, null);
    }
  });
}

function getLocationAll(ips, callback) {
  var i = 0;
  var locations = [];
  _get(ips[i]);

  // get location one by one
  function _get(ip) {
    // if no left ip
    // callback with the res
    if (!ip) {
      return callback(null, locations);
    }
    // get location with ip
    getLocation(ip, function (err, location) {
      if (err) {
        console.error(err.stack);
      }
      if (location) {
        locations.push(location);
      }
      if (locations.length === ips.length) {
        callback(err, locations);
      }
      // try to get next one
      i++;
      _get(ips[i]);
    });
  }
}

var file;

function writeFile(json) {
  // if (file === null) {
  //   file = fs.openSync('data.txt', "ax", "0444");
  // }
  var string = JSON.stringify(json);
  var buffer = new Buffer(string, "utf8");
  fs.writeSync("data.txt", buffer, 0, buffer.length);
}

/*
for test: call it once
*/
traceAll(urls, new Date(), new Date().getHours(), function (err, info) {
  if (err) {
    return console.error(err.stack);
  }
  console.log(info);
});

/*
schedule it for requesting every hour
*/
//var sched = later.parse.recur().first().minute();
// var t = later.setInterval(function () {
//   traceAll(new Date());
// }, sched);