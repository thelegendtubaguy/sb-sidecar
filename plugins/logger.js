module.exports = function logger(app) {
  app.addEventSource({ Twitch: ['ChatMessage'] });
  console.log('logger loaded');

  return function loggerMessageHandler(message) {
    try {
      console.log(`Websocket event: ${message.event.source} - ${message.event.type}`);
    } catch {
      throw new Error('logger: Could not process message');
    }
  };
};
