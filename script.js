var traceroute = require('traceroute');

traceroute.trace('google.com', function (err, hops) {
  if (!err) console.log(hops);
});