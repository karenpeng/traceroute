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

// express on its own has no notion
// of a "file". The express.static()
// middleware checks for a file matching
// the `req.path` within the directory
// that you pass it. In this case "GET /js/app.js"
// will look for "./public/js/app.js".

app.use(express.static(__dirname + '/public'));

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
  res.render('index.html');
  // res.json({
  //   "universities": universities
  // });
  res.send({
    "universities": universities
  });
});

var urls = [
  "www.harvard.edu",

  "web.mit.edu",

  "www.stanford.edu",

  "www.cam.ac.uk",

  "www.ox.ac.uk",

  "berkeley.edu",

  "www.princeton.edu",

  "www.yale.edu",

  "www.caltech.edu",

  "www.ucla.edu",

  "www.u-tokyo.ac.jp",

  "www.columbia.edu",

  "www3.imperial.ac.uk",

  "www.uchicago.edu",

  "www.umich.edu",

  "www.ethz.ch",

  "www.cornell.edu",

  "www.jhu.edu",

  "www.kyoto-u.ac.jp",

  "www.utoronto.ca",

  "www.nus.edu.sg",

  "www.upenn.edu",

  "illinois.edu",

  "www.lse.ac.uk",

  "www.ucl.ac.uk",

  "www.useoul.edu",

  "www.nyu.edu",

  "www.wisc.edu",

  "www.cmu.edu",

  "duke.edu",

  "www.washington.edu",

  "www.ucsf.edu",

  "www.ubc.ca",

  "www.mcgill.ca",

  "www.utexas.edu",

  "www.tsinghua.edu.cn",

  "www.northwestern.edu",

  "www.gatech.edu",

  "www.psu.edu",

  "ucsd.edu",

  "english.pku.edu.cn",

  "www.tudelft.nl",

  "www.hku.hk",

  "www.kcl.ac.uk",

  "www.unimelb.edu.au",

  "www.ed.ac.uk",

  "www.en.uni-muenchen.de",

  "www.purdue.edu",

  "www.epfl.ch",

  "www.osaka-u.ac.jp",

  "www.ucdavis.edu",

  "www.ust.hk",

  "ki.se",

  "www.kaist.edu",

  "www.manchester.ac.uk",

  "www1.umn.edu",

  "www.msu.ru",

  "www.osu.edu",

  "www.ntu.edu.tw",

  "www.titech.ac.jp",

  "www.anu.edu.au",

  "www.ucsb.edu",

  "www.umass.edu",

  "www.msu.edu",

  "unc.edu",

  "www.uni-heidelberg.de",

  "www.usc.edu",

  "sydney.edu.au",

  "www.tum.de",

  "www.tohoku.ac.jp",

  "www.uva.nl",

  "www.bu.edu",

  "www.hu-berlin.de",

  "www.indiana.edu",

  "www.kuleuven.be",

  "www.metu.edu.tr",

  "www.paris-sorbonne.fr",

  "www.pitt.edu"
];

urls = [
  "www.cmu.edu",

  "www.google.com",

  "www.stanford.edu",

  "www.cam.ac.uk",

  "www.ox.ac.uk",

  "berkeley.edu",

  "www.princeton.edu",

  "www.yale.edu",

  "www.caltech.edu",

  "www.ucla.edu"
];

var universities = [];

function trace(_date, _time, _index, _url, callback) {
  var pathname = _url;
  var _route = [];
  var _times = [];
  var info;
  cp.exec("traceroute " + pathname, {
    setTimeout: 5 * 60 * 1000
  }, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
      callback(err);
    }
    var out = stdout.split('\n');
    out.forEach(function (o) {
      var ip = getIP(o);
      if (ip !== undefined) {
        _route.push(ip);
      }
      var time = getTimePeriod(o);
      if (time !== undefined) {
        _times.push(time);
      }
    });
    // console.log(_route);
    // console.log(_times);
    getLocationAll(_route, function (err, locations) {
      info = {
        "index": _index,
        "date": _date,
        "time": _time,
        "locs": locations,
        "speed": _times
      };
      universities.push(info);
      //write in a file here
      console.log(info);
      writeFile(info);
      callback(null, info);
    });
  });

}

function getTimePeriod(str1) {
  var times = [];
  var timePattern = /\s\d+\.\d+\sms/g;
  var timesWithMs = str1.match(timePattern);
  if (timesWithMs !== null) {
    timesWithMs.forEach(function (str2) {
      var timePattern2 = /\d+\.\d+/g;
      var t = str2.match(timePattern2);
      if (t !== null) {
        times.push(t[0]);
      }
    });
    var sum = 0;
    var avg = 0;
    times.forEach(function (tt) {
      sum += parseFloat(tt);
    });
    avg = sum / times.length;
    return avg;
  }
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
    //console.log(_index);
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
        return;
      }
      // try to get next one
      i++;
      _get(ips[i]);
    });
  }
}

function writeFile(data) {
  // if (file === null) {
  //   file = fs.openSync('data.txt', "ax", "0444");
  // }
  var index = data.index;
  var string = JSON.stringify(data);
  // fs.writeSync("data", buffer, 0, buffer.length, function () {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("The file was saved!");
  //   }
  // });
  fs.appendFile("data" + index + ".txt", string, {
    encodeing: 'utf8'
  }, function (err) {
    if (err) {
      return console.error(err.stack);
    }
    console.log('The data of #' + index + ' university was appended to file!');
  });
}

/*
for test: call it once
*/
traceAll(urls, new Date(), new Date().getHours(), function (err, info) {
  if (err) {
    return console.error(err.stack);
  }
  //console.log(info);
});

// trace(new Date(), new Date().getHours(), 0, "www.cmu.edu", function (err, info) {
//   if (err) {
//     return console.error(err.stack);
//   }
//   console.log(info);
// });

/*
schedule it for requesting every hour
*/
var sched = later.parse.recur().first().minute();
// var t = later.setInterval(function () {
//   traceAll(urls, new Date(), new Date().getHours(), function (err, info) {
//     if (err) {
//       return console.error(err.stack);
//     }
//     //console.log(info);
//   });
// }, sched);