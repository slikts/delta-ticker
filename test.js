'use strict';

require('chai').should();

var Ticker = require('./');

function avgTicks(ticks) {
  var dts = ticks.map(function(x, i, arr) {
    return x - arr[i - 1];
  }).slice(1);

  return dts.reduce(function(a, b) {
    return a + b;
  }) / dts.length;
}

describe('ticker', function() {

  it('should not tick more times than the limit', function(done) {
    var count = 0;
    var config = {
      delay: 2,
      task: function() {
        count += 1;
      },
      limit: 5
    };

    Ticker(config).start();

    setTimeout(function() {
      if (count === config.limit) {
        done();
      } else if (count > config.limit) {
        count.should.equal(config.limit);
      }
    }, (config.limit + 2) * config.delay);
  });

  it('missing config properties should result in an error when starting', function() {
    var ticker = Ticker();
    ticker.start.bind(ticker).should['throw'](/missing config prop/i);

    ticker.use({
      delay: 0,
      task: function() {}
    }).start.bind(ticker).should.not['throw'](Error);
  });

  it('should tick async-ously for a number of times', function(done) {
    var count = 0;
    var config = {
      delay: 10,
      task: function(done) {
        count += 1;
        setImmediate(done);
      },
      async: true,
      limit: 5
    };
    Ticker(config).start();

    setTimeout(function() {
      if (count === config.limit) {
        done();
      }
    }, (config.limit + 2) * config.delay);
  });

  it('should tick with the delays averaging out to config.delay', function(done) {
    var ticks = [];

    var config = {
      delay: 5,
      task: function(done) {
        ticks.push(Date.now());
        setTimeout(done, 5);
      },
      async: true,
      limit: 20,
      stop: function() {
        var avg = avgTicks(ticks);

        avg.should.be.gte(config.delay - 0.1);
        avg.should.be.lt(config.delay + 1.5);

        done();
      }
    };

    Ticker(config).start();
  });

  it('should tick with the delays averaging out to a bigger config.delay', function(done) {
    var ticks = [];

    var config = {
      delay: 25,
      task: function(done) {
        ticks.push(Date.now());
        setTimeout(done, 1);
      },
      async: true,
      limit: 20,
      stop: function() {
        var avg = avgTicks(ticks);

        avg.should.be.gte(config.delay - 0.1);
        avg.should.be.lt(config.delay + 0.5);

        done();
      }
    };

    Ticker(config).start();
  });

  it('should throw an error if attempting to start an already started timer', function() {
    (function() {
      Ticker({
        task: function() {},
        delay: 0
      }).start().start();
    }).should['throw'](/already started/);
  });

  it('should throw an error if attempting to stop an already stopped timer', function() {
    (function() {
      Ticker({
        task: function() {},
        delay: 0
      }).stop();
    }).should['throw'](/ticker not started/i);
  });

  it('should call config.stop() callback after stopping', function(done) {
    Ticker({
      task: function() {},
      delay: 0,
      limit: 1,
      stop: done
    }).start();
  });

  it('should pass the delta time to the task', function(done) {
    var ticks = [];

    var config = {
      task: function(dt) {
        ticks.push(dt);
      },
      delay: 2,
      limit: 10,
      stop: function() {
        var avg = ticks.reduce(function(a, b) {
          return a + b;
        }) / ticks.length;
        avg.should.be.lt(this.delay + 1);
        avg.should.be.gt(this.delay - 0.1);
        ticks.length.should.equal(this.limit);
        done();
      }
    };

    Ticker(config).start();
  });

  it('should pass the delta time to the task in async mode', function(done) {
    var ticks = [];

    var config = {
      task: function(done, dt) {
        ticks.push(dt);
        done();
      },
      async: true,
      delay: 2,
      limit: 10,
      stop: function() {
        var avg = ticks.reduce(function(a, b) {
          return a + b;
        }) / ticks.length;
        avg.should.be.lt(this.delay + 1);
        avg.should.be.gt(this.delay - 0.1);
        ticks.length.should.equal(this.limit);
        done();
      }
    };

    Ticker(config).start();
  });

  it('should call the task just once after the specified delay (work like setTimeout)', function(done) {
    var count = 0;
    var _dt;

    var config = {
      task: function(dt) {
        count += 1;
        _dt = dt;
      },
      delay: 25,
      limit: 1,
      stop: function() {
        count.should.equal(this.limit);
        _dt.should.be.gt(this.delay - 0.1);
        _dt.should.be.lt(this.delay + 2);
        done();
      }
    };

    Ticker(config).start();
  });

});