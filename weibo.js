! function(name, definition) {
  if(module !== undefined) {
    module.exports = definition();
  } else {
    this[name] = definition();
    // not applied currently
  }
}('weibo', function() {
  var Class = require('klass');
  var WEIBO_URI = 'https://api.weibo.com/2';
  var request = require('request');

  return Class(function(appId, secret) {
    this.appId = appId;
    this.secret = secret;
    this.accessToken = null;
  }).methods({
    call : function(options, successFn, errorFn) {
      var uri = WEIBO_URI + options.uri + '?access_token=' + this.accessToken;
      if(options.data) {
        uri += '&' + require('querystring').stringify(options.data);
      }
      request({
        method : options.method || 'GET',
        uri : uri
      }, function(e, r, body) {
        var status = r.statusCode === 200;
        if(status) {
          var data = JSON.parse(body);
          successFn(data)
        } else {
          errorFn(body);
        }
      });
    },
    get : function(api, successFn, errorFn) {
      this.call({
        method : 'GET',
        uri : api
      }, successFn, errorFn);
    },
    post : function(api, data, successFn, errorFn) {
      this.call({
        method : 'POST',
        uri : api,
        data : data
      }, successFn, errorFn);
    }
  }).statics({
    middleware : function(options) {
      var appId = options.appId, secret = options.secret, weibo = new this(appId, secret), callbackUrl = options.callbackUrl || '/auth/callback', loginUrl = options.loginUrl || '/auth/login', logoutUrl = options.logoutUrl || '/auth/logout';
      var framework = null;
      try {
        framework = require('matador');
      } catch(e) {
        framework = require('express');
      }
      app.use(framework.router(function(app) {
        app.get(loginUrl, function(req, res, next) {
          var redirectUrl = req.query['redirect'] || '/';
          if(req.session.weibo) {
            res.redirect(redirectUrl);
            return;
          }
          var authorizeUrl = WEIBO_URI + '/oauth2/authorize?client_id=' + appId + '&response_type=code&redirect_uri=http://' + req.headers.host + encodeURI(callbackUrl + '?redirect=' + redirectUrl);
          res.redirect(authorizeUrl);
        });
        app.get(callbackUrl, function(req, res, next) {
          var code = req.query.code;
          request.post({
            uri : WEIBO_URI + '/oauth2/access_token?client_id=' + appId + '&client_secret=' + secret + '&grant_type=authorization_code&code=' + code + '&redirect_uri=http://' + req.headers.host + callbackUrl
          }, function(e, r, body) {
            var status = r.statusCode === 200;
            var data = JSON.parse(body);
            if(status) {
              weibo.accessToken = data['access_token'];
              req.session.weibo = weibo;
            }
            res.redirect(req.query['redirect'] || '/');
          });
        });
        app.get(logoutUrl, function(req, res, next) {
          req.session.weibo = null;
          res.redirect('/');
        });
      }));
      return function(req, res, next) {
        if(req.session.weibo) {
          req.weibo = weibo;
        }
        next();
      }
    }
  });
});
