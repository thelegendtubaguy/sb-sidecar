const WebSocket = require('ws');
const _ = require('lodash');

function gettype(obj) {
  const type = typeof obj;

  if (type !== 'object') {
    return type;
  }

  return toString.call(obj)
    .replace(/^\[object (\S+)\]$/, '$1');
}

/**
 * Sidecar prototype
 */
const app = {};

/**
 * Initialize the application
 *
 * @private
 */
app.init = function init() {
  console.log('Initializing sidecar...');

  const env = process.env.NODE_ENV || 'development';
  const sbip = process.env.SB_IP || '127.0.0.1';
  const sbport = process.env.SB_PORT || '7474';
  const sbendpoint = process.env.SB_ENDPOINT || '/';

  this.subscribeEvent = {
    request: 'Subscribe',
    id: 'startSubscribeEvent',
    events: {},
  };

  this.plugins = [];
  this.settings = {};
  this.set('env', env);
  this.set('sbip', sbip);
  this.set('sbport', sbport);
  this.set('sbendpoint', sbendpoint);
};

/**
 * Handle a Streamer.bot message
 *
 * @private
 */
app.handle = function handle(message) {
  this.plugins.forEach((plugin) => {
    try {
      plugin(message, this.connection);
    } catch (e) {
      console.log(e);
      console.log('Continuing...');
    }
  });
};

/**
 * Adds an event to subscribe to SB
 *
 * @public
 */
app.addEventSource = function addEventSource(event) {
  this.subscribeEvent.events = _.mergeWith({}, this.subscribeEvent.events, event, (a, b) => {
    if (_.isArray(a)) {
      return b.concat(a);
    }
    return undefined;
  });
};

/**
 * Handle websocket connection
 *
 * @public
 */
app.connect = function connect() {
  const url = `ws://${this.settings.sbip}:${this.settings.sbport}${this.settings.sbendpoint}`;
  console.log(`Connecting to ${url}`);
  const connection = new WebSocket(url);
  this.connection = connection;
  const self = this;

  connection.onclose = function onclose(evt) {
    if (evt.code === 3001 || evt.code === 1005) {
      console.log('Websocket closed');
    } else {
      console.log('Could not connect to Streamer.bot');
    }
  };

  connection.onerror = function onerror(evt) {
    if (connection.readyState === 1) {
      console.log(`Websocket error: ${evt.type}`);
    }
  };

  connection.onopen = function onopen() {
    console.log('Subscribing to events');
    connection.send(JSON.stringify(self.subscribeEvent));
  };

  connection.onmessage = (e) => {
    const response = JSON.parse(e.data);
    if (response.id === self.subscribeEvent.id && response.status === 'ok') {
      console.log('Successfully subscribed to events requested by plugins');
    } else {
      self.handle(response);
    }
  };
};

/**
 * Assign a setting value
 *
 * @public
 */
app.set = function set(setting, val) {
  console.log(`Setting ${setting} to ${val}`);
  this.settings[setting] = val;
};

/**
 * Add plugins to the app message handler
 *
 * @public
 */
app.use = function use(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError(`app.use() requires a plugin function but got a ${gettype(fn)}`);
  }
  console.log(`Loading plugin: ${fn.name}`);
  this.plugins.push(fn(this));
};

module.exports = app;
