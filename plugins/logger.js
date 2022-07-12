module.exports = function logger() {
  console.log('logger loaded');

  return function loggerMessageHandler(message) {
    try {
      console.log(message);
    } catch {
      throw new Error('logger: Could not process message');
    }
  };
};
