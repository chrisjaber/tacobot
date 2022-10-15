const Botkit = require("botkit");
const config = require("./config.js");

const controller = Botkit.slackbot(config.controller);
const bot = controller.spawn({
  token: config.token,
});

console.log(`Sending message to ${config.kingBurritoId}`)
bot.say({text: "Test Bot Message", channel:config.kingBurritoId})
// bot.say({text: 'ok', channel:'U01TU3LV5U6'})
// bot.startPrivateConversation('U01TU3LV5U6')
// bot.say(`You just received ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} from ${senderName}!`)
