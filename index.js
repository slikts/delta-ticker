'use strict';

/** 
 * Simple delta time ticker.
 * @module delta-ticker
 */

var defaults = {
  limit: 0,
  async: false
};

// The constructor will fail if these config properties are missing
var required = ['delay', 'task'];

/**
 * @constructor
 * @alias module:delta-ticker
 * @param {{ limit: Number, async: Boolean, task: Function, stop: Function }} config
 */
function Ticker(config) {
  var obj = Object.create(proto);
  var _config = obj._config = Object.create(defaults);
  var missing = !config ? required : required.filter(function(key) {
    return config[key] === undefined;
  });

  if (missing.length) {
    throw TypeError('Missing config properties: ' + missing.join(', '));
  }

  // Extend the default config
  Object.keys(config).forEach(function(key) {
    _config[key] = config[key];
  });

  obj._tick = obj._tick.bind(obj);
  obj._tock = obj._tock.bind(obj);

  return obj;
}

var proto = Ticker.prototype = {
  _started: false,
  _count: 0,

  /** 
   * Start the ticker, setting the timeout for the first tick.
   * @returns {Ticker}
   */
  start: function _start() {
    if (this._started) {
      throw Error('Ticker already started');
    }

    this._started = true;
    this._before = Date.now();
    this._count = 0;

    this._tick();

    return this;
  },

  /** 
   * Stop the ticker, clearing any currently set timeouts.
   * @returns {Ticker}
   */
  stop: function _stop() {
    if (!this._started) {
      throw Error('Ticker not started');
    }

    if (this._config.stop) {
      this._config.stop();
    }

    this._started = false;
    delete this._count;
    clearTimeout(this._timeout);

    return this;
  },

  // The first part of an iteration that determines how to call the second part
  _tick: function _tick() {
    var config = this._config;

    if (!this._started) {
      // The ticker has been stopped
      return;
    }

    // Remember the time before running config.task()
    this._before = Date.now();

    if (config.async) {
      config.task(this._tock);
    } else {
      config.task();
      this._tock();
    }
  },

  // The second part of an iteration that is called after config.task() is done
  _tock: function _tock() {
    var config = this._config;
    var now = Date.now();
    var dt = Math.max(0, config.delay - (now - this._before));

    if (config.limit) {
      this._count += 1;

      if (this._count >= config.limit) {
        this.stop();
      }
    }

    this._before = now + dt;

    setTimeout(this._tick, dt);
  }
};

module.exports = Ticker;