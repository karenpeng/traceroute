(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/routeTrace2/node_modules/traceroute/index.js":[function(require,module,exports){
module.exports = require('./traceroute');

},{"./traceroute":"/Users/karen/Documents/my_project/routeTrace2/node_modules/traceroute/traceroute.js"}],"/Users/karen/Documents/my_project/routeTrace2/node_modules/traceroute/traceroute.js":[function(require,module,exports){
var child = require('child_process'),
    net = require('net'),
    dns = require('dns'),
    isWin = (/^win/.test(require('os').platform()));


function parseHop(line) {
  line = line.replace(/\*/g,'0');
  if (isWin) line = line.replace(/\</g,'');
  var s = line.split(' ');
  for (var i=s.length - 1; i > -1; i--) {
    if (s[i] === '') s.splice(i,1);
    if (s[i] === 'ms') s.splice(i,1);
  }

  if (isWin) return parseHopWin(s);
  else return parseHopNix(s);
}

function parseHopWin(line) {
  if (line[4] === 'Request')
    return false;

  var hop = {};
  hop[line[4]] = [ +line[1], +line[2], +line[3]];

  return hop;
}

function parseHopNix(line) {
  if (line[1] === '0') 
    return false;
  
  var hop = {},
      lastip = line[1];

  hop[line[1]] = [+line[2]];

  for (var i=3; i < line.length; i++) {
    if (net.isIP(line[i])) {
      lastip = line[i];
      if (!hop[lastip])
        hop[lastip] = [];
    }
    else hop[lastip].push(+line[i]);
  }

  return hop;
}

function parseOutput(output,cb) {
  var lines = output.split('\n'),
      hops=[];

  lines.shift();  
  lines.pop();

  if (isWin) { 
    for (var i = 0; i < lines.length; i++)
      if (/^\s+1/.test(lines[i]))
        break;
    lines.splice(0,i);
    lines.pop(); lines.pop();
  }

  for (var i = 0; i < lines.length; i++)
    hops.push(parseHop(lines[i]));

  cb(null,hops);
}

function trace(host,cb) {
  dns.lookup(host, function (err) {
    if (err && net.isIP(host) === 0)
      cb('Invalid host');
    else {
      var traceroute;

      if (isWin) {
        traceroute = child.exec('tracert -d ' + host, function (err,stdout,stderr) {
          if (!err)
            parseOutput(stdout,cb);
        });
      }
      else {
        traceroute = child.exec('traceroute -q 1 -n ' + host, function (err,stdout,stderr) {
          if (!err)
            parseOutput(stdout,cb);
        });
      }
    }
  });
}

exports.trace = function (host,cb) {
  host = host + '';
  trace(host.toUpperCase(),cb);
}

},{"child_process":"/usr/local/lib/node_modules/watchify/node_modules/browserify/lib/_empty.js","dns":"/usr/local/lib/node_modules/watchify/node_modules/browserify/lib/_empty.js","net":"/usr/local/lib/node_modules/watchify/node_modules/browserify/lib/_empty.js","os":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/os-browserify/browser.js"}],"/Users/karen/Documents/my_project/routeTrace2/script.js":[function(require,module,exports){
var traceroute = require('traceroute');

traceroute.trace('google.com', function (err, hops) {
  if (!err) console.log(hops);
});
},{"traceroute":"/Users/karen/Documents/my_project/routeTrace2/node_modules/traceroute/index.js"}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/lib/_empty.js":[function(require,module,exports){

},{}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/os-browserify/browser.js":[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}]},{},["/Users/karen/Documents/my_project/routeTrace2/script.js"]);
