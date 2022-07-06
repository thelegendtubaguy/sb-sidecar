module.exports = function giftBomb(app) {
  app.addEventSource({ Twitch: ['GiftSub', 'GiftBomb'] });
  console.log('giftBomb loaded');

  const activeGiftBombs = {};

  return function giftBombMessageHandler(message, conn) {
    try {
      const { data, event } = message;
      if (event.source === 'Twitch' && event.type === 'GiftBomb') {
        console.log(`Gift bomb event detected from ${data.displayName}`);
        activeGiftBombs[data.displayName] = {
          count: data.gifts,
          total: data.totalGifts,
          subTier: data.subTier,
          names: [],
        };
      } else if (event.source === 'Twitch' && event.type === 'GiftSub') {
        if (data.fromSubBomb === true) {
          activeGiftBombs[data.displayName].names.push(data.recipientDisplayName);
          const nameCount = activeGiftBombs[data.displayName].names.length;
          const giftCount = activeGiftBombs[data.displayName].count;
          if (nameCount >= giftCount) {
            console.log('I have a list of names from the GiftBomb event');
            console.log(activeGiftBombs[data.displayName].names);
          }
        }
      }
    } catch {
      throw new Error('giftBomb: Could not process message');
    }
  };
};
