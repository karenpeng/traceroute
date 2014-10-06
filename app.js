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
  //res.render('index');
  res.json({
    info: routes
  });

  // routes.forEach(function (route) {
  //   route.forEach(function () {

  //   });
  // });
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
function trace(_date, _index, _url, callback) {

  var _route = [];
  var info;
  var pathname = _url;
  var starCount = 0;

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
        getLocation(ip);
      }
    });

    info = {
      index: _index,
      date: _date,
      route: _route
    };
    routes.push(info);
    //writeFile(info);
    callback(null, info);
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

function traceAll(_date, callback) {
  urls.forEach(function (_url, _index, callback) {
    trace(_date, _index, _url, callback);
  });
}

function getLocation(ip) {
  urllib.request('http://ipinfo.io/' + ip, {
    method: 'GET',
    dataType: 'jsonp'
  }, function (err, data, res) {
    if (err) {
      return console.error(err.stack);
    }
    console.log(res);
    //console.log(res.loc);
    //console.log(data);
    //var str = res.loc;
    // var result = str.split(",");
    // var lat = parseFloat(result[0]);
    // var lng = parseFloat(result[1]);
    // console.log(lat, lng);
    //locs.push([lat,lng]);
    //callback(err)
  });
}

function getLocationAll(ips, callback) {
  var ip = ips.unshift();
  var res = [];
  _get();

  // get location one by one
  function _get(ip) {
    // if no left ip
    // callback with the res
    if (!ip) {
      return callback(null, res);
    }

    // get location with ip
    getLocation(ip, function (err, location) {
      if (err) {
        console.error(err.stack);
      }

      if (location) {
        res.push({
          ip: ip,
          location: location
        });
      }

      // try to get next one
      _get(ips.unshift());
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

//traceAll(new Date(),function (err, info) {
//   if (err) {
//     return console.error(err.stack);
//   }
//   console.log(info);
// });

trace(new Date(), 0, "www.cmu.edu", function (err, info) {
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