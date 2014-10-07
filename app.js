var cp = require('child_process'); // include exec module
var later = require('later');
var fs = require("fs");
var urllib = require('urllib');

// var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({
//   extended: false
// });

var urls = [
  "www.cmu.edu",
  "www.google.com"
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

var file;

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
  fs.writeFileSync("data" + index, string);
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
//var sched = later.parse.recur().first().minute();
// var t = later.setInterval(function () {
//   traceAll(new Date());
// }, sched);