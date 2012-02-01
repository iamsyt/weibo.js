weibo.js
--------
[Matador](http://obvious.github.com/matador/) compliant weib.com API SDK, supporting oAuth flow and general API calls

Usage

---------
<h3>Init a matador based application</h3>

``` bash
matador init matador-app
cd matador-app
```

---------
<h3>Register weibo middleware in ./server.js</h3>

``` js
app.use(require('weibo-js').middleware({
  appId : 'appId',
  secret : 'appSecret'
}))
```

<h3>Register a filter in base controller, ./app/controllers/ApplicationController.js</h3>

``` js
module.exports = require('matador').BaseController.extend(function() {
  this.viewFolder = '';
  this.addBeforeFilter(this.requireAuth)
}).methods({
  requireAuth : function(callback) {
    if(this.request.weibo)
      return callback(null)
    this.response.redirect('/auth/login?redirect=' + this.request.url);
  }
})
```

<h3>Call APIs in sub controller, e.g. ./app/controllers/HomeController.js</h3>

``` js
module.exports = require(app.set('controllers') + '/ApplicationController').extend(function() {
  this.addExcludeFilter(['index'], this.requireAuth)
}).methods({
  index : function() {
    this.render('index', {
      title : 'The Matador Framework'
    })
  },
  status : function() {
    var that = this;
    this.request.weibo.get('/statuses/friends_timeline.json', function(status) {
      that.json(status);
    }, function(error) {
      console.log(error);
      that.render('500');
    });
  }
})
```

Contributors
------------
  * [Yonggao Pan](https://github.com/yonggao/weibo.js/commits/master?author=yonggao)
