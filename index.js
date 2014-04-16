'use strict';

var defaults = {
  immediate: false,
  limit: 0,
  async: false
};

var required = ['delay', 'tick'];

var proto = Ticker.prototype = {
  _started: false,
  _count: 0,
  init: function(config) {
    var missing = !config ? required : required.filter(function(key) {
      return config[key] === undefined;
    });
    var _config = Object.create(defaults);

    if (missing.length) {
      throw Error('Missing config properties: ' + missing.join(', '));
    }

    // Extend default config
    Object.keys(config).forEach(function(key) {
      _config[key] = config[key];
    });

    this._tick = this._tick.bind(this);
    this._tock = this._tock.bind(this);

    this._config = _config;
  },
  start: function _start() {
    if (this._started) {
      throw Error('Ticker already started');
    }

    this._started = true;
    this._count = 0;

    this._tick();

    return this;
  },
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
  _tick: function _tick() {
    var config = this._config;

    if (!this._started) {
      return;
    }

    if (config.async) {
      config.tick(this._tock);
    } else {
      config.tick();
      this._tock();
    }
  },
  _tock: function _tock() {
    var config = this._config;
    var now = Date.now();
    var dt = config.delay - (now - before);

    if (config.limit) {
      this._count += 1;

      if (this._count >= config.limit) {
        this.stop();
      }
    }

    if (config.delay === 0 || dt <= 0) {
      setImmediate(this._tick);
    } else {
      setTimeout(this._tick, config.delay);
    }
  }
};

function Ticker(config) {
  var obj = Object.create(proto);

  obj.init(config);

  return obj;
}

module.exports = Ticker;