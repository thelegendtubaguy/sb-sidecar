module.exports = function giftBomb(app) {
  app.addEventSource({ Twitch: ['GiftSub', 'GiftBomb'] });

  const activeGiftBombs = {};
  let sbAction = '';
  if (Object.prototype.hasOwnProperty.call(app.settings, 'giftBombAction')) {
    sbAction = app.settings.giftBombAction;
  } else {
    throw new Error('giftBomb: You must set the SB action to use by setting giftBombAction to the name of your SB action');
  }

  console.log('giftBomb Loaded');

  return function giftBombMessageHandler(message, conn) {
    try {
      if (Object.prototype.hasOwnProperty.call(message, 'data') && Object.prototype.hasOwnProperty.call(message, 'event')) {
        const { data, event } = message;
        if (event.source === 'Twitch' && event.type === 'GiftBomb') {
          console.log(`giftBomb: Gift bomb event detected from ${data.displayName}`);
          activeGiftBombs[data.displayName] = {
            count: data.gifts,
            total: data.totalGifts,
            subTier: data.subTier,
            names: [],
          };
        } else if (event.source === 'Twitch' && event.type === 'GiftSub') {
          console.log(`giftBomb: Gift sub event detected from ${data.displayName}`);
          if (data.fromSubBomb === true) {
            activeGiftBombs[data.displayName].names.push(data.recipientDisplayName);
            const { names } = activeGiftBombs[data.displayName];
            const giftCount = activeGiftBombs[data.displayName].count;
            if (names.length >= giftCount) {
              const tier = activeGiftBombs[data.displayName].subTier;
              const totalGifted = activeGiftBombs[data.displayName].total;
              console.log(`giftBomb: GiftBomb from ${data.displayName} complete.`);
              let printMessage = `${data.displayName} JUST DROPPED ${giftCount} tier ${tier} SUBS!\n\n`;
              printMessage += `They've gifted ${totalGifted} subs total!\n\n\n\n`;
              for (const i of Object.values(names)) {
                printMessage += `${i}\n`;
              }
              const printGiftBombEvent = {
                request: 'DoAction',
                id: 'printGiftBombEvent',
                action: {
                  name: sbAction,
                },
                args: {
                  printMessage,
                },
              };
              try {
                conn.send(JSON.stringify(printGiftBombEvent));
              } catch {
                throw new Error('giftBomb: Could not ask SB to print gift bomb event');
              }
            }
          }
        }
      } else if (Object.prototype.hasOwnProperty.call(message, 'id')) {
        if (message.id === 'printGiftBombEvent') {
          if (message.status === 'ok') {
            console.log('giftBomb: Successfully fired giftBomb action');
          } else {
            console.log('giftBomb: Could not fire giftBomb action');
          }
        }
      }
    } catch (e) {
      console.log(message);
      throw new Error(`giftBomb: Could not process the proceeding message. ${e.message}`);
    }
  };
};
