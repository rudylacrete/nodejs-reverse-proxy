var httpProxy = require('http-proxy');
var http = require('http');
var port = 8000;

var hosts = require('./config.json');

var proxies = {}
Object.keys(hosts).forEach(function(host){
  proxies[host+":"+port] = new httpProxy.createProxyServer(hosts[host]);
  proxies[host+":"+port].on('error',errorHandler);
});

function errorHandler(err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
}

function getHostname(req){
  return req.headers.host;
}

var server = http.createServer(function (req, res) {
  var host = getHostname(req);
  if(host!==null && proxies.hasOwnProperty(host)){
    proxies[host].web(req, res);
  }
  else{
    res.writeHead(500,{
      'Content-Type': 'text/plain'
    });
    res.end("Invalid host header.");
  }
});

server.on('upgrade', function (req, socket, head) {
  var host = getHostname(req);
  if(host!==null && proxies.hasOwnProperty(host)){
    proxies[host].ws(req, socket, head);
  }
});

server.listen(port);
