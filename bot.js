const parser = require("./parser.js");
const taco = require("./taco.js");
const DB = require("./db.js");
const config = require("./config.js");

const forTaco = controller => {
  controller.hears(":taco:", "ambient", (bot, message) => {
    const id = parser.findID(message.text);
    if (id !== null) {
      const ids = DB.getIDs();
      const userIndex = ids.indexOf(id);
      const senderIndex = ids.indexOf(message.user);
      const tacosGiven = parser.countTacos(message.text);
      const kingBurrito = message.user === config.kingBurritoId;
      if ((userIndex > -1 && userIndex !== senderIndex) || kingBurrito) {
        const giver = DB.getUser(senderIndex);
        if (giver.left >= tacosGiven || kingBurrito) {
          taco.giveTaco(userIndex, tacosGiven);
          taco.removeLeft(senderIndex, tacosGiven);
          const senderName = DB.getUsername(senderIndex)
          const receiverName = DB.getUsername(userIndex)
          console.log(`${senderName} gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to ${receiverName}`)
          let msg = `You just received ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} from <@${senderName}>!`
          bot.say({text: msg, channel:ids[userIndex]})
          let senderMsg = `You just gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to <@${receiverName}>!`
          bot.say({text: senderMsg, channel:ids[senderIndex]})
          // bot.say(`You just received ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} from ${senderName}!`)
          // bot.api.reactions.add(
          //   {
          //     timestamp: message.ts,
          //     channel: message.channel,
          //     name: "taco"
          //   },
          //   function(err, res) {
          //     if (err) {
          //       bot.botkit.log("Failed to add emoji reaction :(", err);
          //     }
          //   }
          // );
        } else {
          bot.reply(
            message,
            `Sorry <@${message.user}>, you only have ${
              giver.left
            } taco${giver.left === 1 ? '': 's'} remaning and you tried to give *${tacosGiven}*`
          );
        }
      }
    }
  });
};

const forReaction = controller => {
  controller.on('reaction_added', function(bot, event) {
    let isTaco = event.reaction == 'taco'
    if (!isTaco) return;

    const user = event.user // message reactor
    const sender = event.item_user // message sender

    const ids = DB.getIDs();
    const userIndex = ids.indexOf(sender);
    const senderIndex = ids.indexOf(user);
    const tacosGiven = 1;
    const kingBurrito = user === config.kingBurritoId;
    if ((userIndex > -1 && userIndex !== senderIndex) || kingBurrito) {
      const giver = DB.getUser(senderIndex);
      if (giver.left >= tacosGiven || kingBurrito) {
        taco.giveTaco(userIndex, tacosGiven);
        taco.removeLeft(senderIndex, tacosGiven);
        const senderName = DB.getUsername(senderIndex)
        const receiverName = DB.getUsername(userIndex)
        console.log(`${senderName} gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to ${receiverName}`)
        let msg = `You just received ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} from <@${senderName}>!`
        bot.say({text: msg, channel:ids[userIndex]})
        let senderMsg = `You just gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to <@${receiverName}>!`
        bot.say({text: senderMsg, channel:ids[senderIndex]})
      } else {
        let msg = `Sorry <@${user}>, you only have ${
          giver.left
        } taco${giver.left === 1 ? '': 's'} remaning and you tried to give *${tacosGiven}*`
        bot.say({text: msg, channel:ids[userIndex]})
      }
    }
  })
  
}

const forScore = controller => {
  controller.hears(
    ["score", "ranking"],
    ["direct_mention", "direct_message"],
    (bot, message) => {
      const users = DB.getUsers();
      const ranked = users.sort((a, b) => b.tacos - a.tacos);
      const firsts = ranked.slice(0, 5).filter(u => u.tacos > 0);
      const sentences = firsts.map(
        (user, index) =>
          `<@${user.id}> is number ${index + 1} with *${user.tacos}* taco${user.tacos === 1 ? '': 's'}`
      );
      bot.reply(message, sentences.join("\n"));
    }
  );
};

const forLeft = controller => {
  controller.hears(
    ["left", "combien", "how much", "how many"],
    "direct_message",
    (bot, message) => {
      const ids = DB.getIDs();
      const userIndex = ids.indexOf(message.user);
      const user = DB.getUser(userIndex);
      bot.reply(message, `You have ${user.left} taco${user.left === 1 ? '': 's'} left for today`);
    }
  );
};

const forHelp = controller => {
  controller.hears(
    ["help", "aide", "commandes", "commande"],
    ["direct_message", "direct_mention"],
    (bot, message) => {
      bot.reply(
        message,
        `
     In public channels, just ping someone and add the :taco: emoji next to his name.
You can ask me how many :taco: you have left but in direct message:
Just ask me \`left\` (or \`how many\`; \`how much\`)

If you want to know the ranking, ask me \`score\` or \`ranking\`
    `
      );
    }
  );
};

const listens = controller => {
  forTaco(controller);
  forReaction(controller);
  forScore(controller);
  forLeft(controller);
  forHelp(controller);
};

module.exports = {
  listens
};
