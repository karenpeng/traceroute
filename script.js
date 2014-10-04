// var ping = require('net-ping');
// var session = ping.createSession();

// session.pingHost("www.google.com", function (error, target) {
//   if (error)
//     console.log(target + ": " + error.toString());
//   else
//     console.log(target + ": Alive");
// });

var ping = require('ping');

var hosts = ['192.168.1.1', 'google.com', 'yahoo.com'];
hosts.forEach(function (host) {
  ping.sys.promise_probe(host)
    .then(function (res) {
      console.log(res);
    });
});