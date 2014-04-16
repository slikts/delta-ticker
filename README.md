# Simple delta time ticker

Allows setting intervals using delta time for consistency. The difference from `setInterval` is that
tasks can be asynchronous and can't run into eachother.

### Examples

Asynchronously count to 5 with 15 millisecond intervals:

```
var count = 0;
Ticker({ // the `new` keyword is not required
  async: true,
  task: function(next) {
    setTimeout(function() {
      count += 1;
      next();
    }, 10); // task will take 10ms, but the interval will still be 15ms on average
  },
  limit: 5,
  delay: 15,
  stop: function() {
    console.log(count === 15);
  }
}).start();
```

Endless 100 millosecond interval with a synchronous task:

```
Ticker({
  task: function() { // unlike with the async example, there's no `next` argument
    console.log('on and on…');
  },
  delay: 100
}).start();
```

Stop a ticker:
```
var ticker = Ticker({
  task: function() {
    // do something…
  },
  delay: 100
});

setTimeout(function() {
  ticker.stop();
}, 500);
```

### TODO

 * An option to use `process.hrtime()` (real time) in Node.js

### Notes

 * Depends on `Date.new` and `Object.create`
 * The intervals will never be shorter than specified
 * The average intervals can be a few milliseconds longer than specified for short delays (<7ms)