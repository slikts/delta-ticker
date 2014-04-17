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
  var obj = Object.create(Ticker.prototype);
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

Ticker.prototype = {
  _started: null, // Timestamp for when the last task was started
  _count: 0, // Used with config.limit

  /** 
   * Start the ticker, setting the timeout for the first tick.
   * @returns {Ticker}
   */
  start: function _start() {
    if (this._started) {
      throw Error('Ticker already started');
    }

    this._started = Date.now();

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
    clearTimeout(this._timeout);
    delete this._started;
    delete this._count;

    if (this._config.stop) {
      this._config.stop();
    }

    return this;
  },

  // The first part of an iteration that determines how to call the task
  _tick: function _tick() {
    var config = this._config;

    if (!this._started) {
      // The ticker has been stopped
      return;
    }

    if (config.async) {
      config.task(this._tock);
    } else {
      config.task();
      this._tock();
    }
  },

  // The second part of an iteration that is called after the task is done
  _tock: function _tock() {
    var config = this._config;
    var now = Date.now();
    var taskTime = now - this._started; // The time it took to finish the last task
    var delay = Math.max(0, config.delay - (taskTime)); // Delay until the next task is run

    if (config.limit) {
      this._count += 1;

      if (this._count >= config.limit) {
        this.stop();

        return;
      }
    }

    this._started = now + delay;

    this._timeout = setTimeout(this._tick, delay);
  }
};

module.exports = Ticker;