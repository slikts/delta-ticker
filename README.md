# Simple delta time ticker

Allows setting intervals using delta time for consistency. 

Differences from `setInterval`: 
 * Tasks can be asynchronous
 * Tasks that take longer than the interval won't overlap
 * The intervals are more accurate

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
    console.log(count === 5); // verify that there were 5 steps
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

Log the interval between tasks:

```
var ticker = Ticker({
  task: function(dt) { // the last argument to the task is the delta time
    console.log('%s milliseconds have passed since last task', dt);
  },
  delay: 100
});
```

### Install

`npm install delta-ticker`

### Test

`make test`

### TODO

 * An option to use `process.hrtime()` (real time) in Node.js
 * More accuracy tests and comparisons to `setInterval`

### Notes

 * Depends on `Date.new` and `Object.create`