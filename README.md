# Streamer.bot Sidecar
The Streamer.bot Sidecar listens for events from the Streamer.bot websocket server and passes messages through a series of plugins.  These plugins can do whatever they want with the event information given.

## Getting Started
To get started, run an `npm install` wherever you cloned or exported the code.  Copy `index.js.example` to `index.js`.  If you're running on the same machine as Streamer.bot, you can probably start it using `npm start` using the default settings.  If you need to set connection parameters for Streamer.bot (on a different machine, custom endpoint, running Node on Windows WSL, etc), you can pass the following environment variables:
```
SB_IP
SB_PORT
SB_ENDPOINT
```

### index.js Setup
In order to use the Streamer.bot Sidecar, you'll need to copy `index.js.example` to `index.js`.  It's important that you `app.init`, `app.use`, and `app.connect`... in that order.  You can also use `app.set` to set settings before calling `app.use` if you're utilizing plugins that require that (like the Streamer.bot action ID to fire upon GiftBomb completion with the `giftBomb` plugin).  See the individual plugins for their documentation.  To use another plugin, simple add an `app.use(pluginName)` after requiring it before you call `app.connect()`.

### Plugin Structure
Every plugin needs to follow a very specific structure.  They must export a function which accepts the app object and returns a function that follows the below structure:
```
function myMessageHandler(message, conn) {
  try {
    console.log(`This was the message: ${message}`);
  } catch {
    throw new Error('myMessageHandler: Could not process message');
  }
}
```
`myMessageHandler` accepts the `message` JSON object and `conn`.  `message` is the message output by the websocket server. `conn` is the websocket connection allowing plugins to send messages back to Streamer.bot. Plugins are fired in the order they are loaded in `index.js`.  Plugins can use the `app` object to retrieve settings on initialization.