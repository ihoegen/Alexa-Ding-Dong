var request = require('request');
var querystring = require('querystring');

function sendRequest(endpoint, type, data, callback) {
  var hostname = 'https://dingdong.localtunnel.me/api/' + endpoint;
  if (type === 'get') {
    request('https://dingdong.localtunnel.me/api/'+ endpoint, function (error, response, body) {
      callback(error, body);
    });
  } else {
    request.post({url:hostname, form: data},
      function(err,httpResponse,body){
        callback(err, httpResponse.statusCode, body);
      }
    );
  }
}
module.exports = sendRequest;
