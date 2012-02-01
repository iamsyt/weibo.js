var sink_test = require('sink-test'), sink = sink_test.sink, start = sink_test.start;
sink('weibo.js', function(test, ok, before, after) {
  test('weibo.js middleware', 1, function() {
    ok(false, 'not implemented')
  });
});
start();
