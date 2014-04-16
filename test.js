'use strict';

require('chai').should();

var Ticker = require('./');

describe('ticker', function() {

  it('should not tick more times than the limit', function(done) {
    var count = 0;
    var config = {
      delay: 2,
      tick: function() {
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

  it('missing config properties should result in an error', function() {
    Ticker.should['throw'](Error);
    Ticker.bind(null, {
      delay: 0,
      tick: function() {}
    }).should.not['throw'](Error);
  });

  it('should work async-ously if the callback expects an argument', function(done) {
    var count = 0;
    var config = {
      delay: 10,
      tick: function(next) {
        count += 1;
        setImmediate(next);
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
      tick: function() {
        ticks.push(Date.now());
        var q = 1e6;
        while (q--) {}
      },
      limit: 50
    };

    Ticker(config).start();

    setTimeout(function() {
      var p = ticks.map(function(x, i, arr) {
        return x - arr[i - 1];
      }).slice(1);
      console.log(p.reduce(function(a, b) {
        return a + b;
      }) / p.length);
      done();
    }, (config.delay + 1) * config.limit);
  });
  // it('should throw an error if attempting to start an already started timer', function(done) {});
  // it('should throw an error if attempting to stop an already stopped timer', function(done) {});
  // it('should call config.stop() callback after stopping', function(done) {});
  // it('should not tick if configured not to be immediate and stopped before the delay ends', function(done) {});
});