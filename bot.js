const parser = require("./parser.js");
const taco = require("./taco.js");
const DB = require("./db.js");
const config = require("./config.js");

const forTaco = controller => {
  controller.hears([":taco:", ":tacobell:"], "ambient", (bot, message) => {
    const id = parser.findID(message.text);
    const dateStr = new Date().toISOString().slice(0, -5);
    if (id !== null) {
      const ids = DB.getIDs();
      const userIndex = ids.indexOf(id);
      const senderIndex = ids.indexOf(message.user);
      const tacobell = message.text.includes(":tacobell:");
      const tacosGiven = tacobell ? 12 : parser.countTacos(message.text);
      const kingBurrito = message.user === config.kingBurritoId;
      if (userIndex > -1 && userIndex !== senderIndex) {
        const giver = DB.getUser(senderIndex);
        if (giver.left >= tacosGiven || (tacobell && giver.left == 5)) {
          // if (config.bannedUsers.includes(id)) {
          //   bot.say({text: `Sorry, <@${id}> has been placed under administrative review and is therefore no longer eligible to receive tacos.`, channel:ids[senderIndex]})
          //   return
          // }
          taco.giveTaco(userIndex, tacosGiven);
          taco.removeLeft(senderIndex, (tacobell ? 5 : tacosGiven));
          const senderName = DB.getUsername(senderIndex);
          const receiverName = DB.getUsername(userIndex);
          if (!senderName || !receiverName) return;
          console.log(`${dateStr}: ${senderName} gave ${tacosGiven} taco${tacosGiven === 1 ? "" : "s"} to ${receiverName}`);
          let msg = `You just received ${tacosGiven} taco${tacosGiven === 1 ? "" : "s"} from <@${senderName}>!`;
          bot.say({ text: msg, channel: ids[userIndex] });
          if (!config.silencedUsers.includes(ids[senderIndex])) {
            let senderMsg = `You just gave ${tacosGiven} taco${tacosGiven === 1 ? "" : "s"} to <@${receiverName}>!`;
            bot.say({ text: senderMsg, channel: ids[senderIndex] });
          }
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
          console.log(`${dateStr}: ${senderName} tried to give ${tacosGiven} taco${tacosGiven === 1 ? "" : "s"} to ${receiverName}, but only had ${giver.left}`);
          let noTacoMsg = `Sorry <@${message.user}>, you only have ${giver.left} taco${giver.left === 1 ? "" : "s"} remaning and you tried to give *${tacosGiven}*`;
          bot.say({ text: noTacoMsg, channel: ids[senderIndex] });
        }
      }
    }
  });
};

const forReaction = controller => {
  controller.on('reaction_added', function(bot, event) {
    let isTaco = event.reaction == 'taco'
    if (!isTaco) return;

    const dateStr = new Date().toISOString().slice(0,-5)
    const sender = event.user // message reactor
    const user = event.item_user // message sender

    const ids = DB.getIDs();
    const userIndex = ids.indexOf(user);
    const senderIndex = ids.indexOf(sender);
    const tacosGiven = 1;
    const kingBurrito = user === config.kingBurritoId;
    if ((userIndex > -1 && userIndex !== senderIndex)) {
      const giver = DB.getUser(senderIndex);
      if (giver.left >= tacosGiven) {
        // if (config.bannedUsers.includes(id)) {
        //   bot.say({text: `Sorry, <@${id}> has been placed under administrative review and is therefore no longer eligible to receive tacos.`, channel:ids[senderIndex]})
        //   return
        // }
        taco.giveTaco(userIndex, tacosGiven);
        taco.removeLeft(senderIndex, tacosGiven);
        const senderName = DB.getUsername(senderIndex)
        const receiverName = DB.getUsername(userIndex)
        console.log(`${dateStr}: ${senderName} gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to ${receiverName}`)
        let msg = `You just received ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} from <@${senderName}>!`
        bot.say({text: msg, channel:ids[userIndex]})
        if (!config.silencedUsers.includes(sender)){
          let senderMsg = `You just gave ${tacosGiven} taco${tacosGiven === 1 ? '': 's'} to <@${receiverName}>!`
          bot.say({text: senderMsg, channel:ids[senderIndex]})
          }
      } else {
        let msg = `Sorry <@${sender}>, you only have ${
          giver.left
        } taco${giver.left === 1 ? '': 's'} remaning and you tried to give *${tacosGiven}*`
        bot.say({text: msg, channel:ids[senderIndex]})
      }
    }
  })
  
}

const forScore = controller => {
  controller.hears(
    ["leaderboard"],
    ["direct_mention", "direct_message"],
    (bot, message) => {
      const users = DB.getUsers();
      const ranked = users.sort((a, b) => b.tacos - a.tacos);
      const firsts = ranked.slice(0, 10).filter(u => u.tacos > 0);
      const sentences = firsts.map(
        (user, index) =>
          `<@${user.id}> is number ${index + 1} with *${user.tacos}* taco${user.tacos === 1 ? '': 's'}`
      );
      bot.reply(message, sentences.join("\n"));
    }
  );
};

const forUser = controller => {
  controller.hears(
    ["score", "ranking"],
    "direct_message",
    (bot, message) => {
      const ids = DB.getIDs();
      const userIndex = ids.indexOf(message.user);
      const users = DB.getUsers();
      const user = DB.getUser(userIndex);
      const ranked = users.sort((a, b) => b.tacos - a.tacos);
      // const userRanking = ranked.indexOf(user);
      const userRanking = users.sort((a, b) => b.tacos - a.tacos).map(DBUser => DBUser.id).indexOf(message.user)+1;
      bot.reply(message, `You are ranked #${userRanking} with ${user.tacos} taco${user.left === 1 ? '': 's'}`);
    }
  );
};



const forLeft = controller => {
  controller.hears(
    ["left", "how much", "how many"],
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
    ["help"],
    ["direct_message", "direct_mention"],
    (bot, message) => {
      bot.reply(
        message,
        `
In the <#C0FQWQXNY> channel, just mention someone and add the :taco: emoji next to their name. You can also react to a message with the :taco: emoji to give the sender a taco.

You can find out how many :taco: you have left by direct messaging me \`left\` or \`how many\`.

You can see your ranking and how many tacos you have by asking \`score\` or \`ranking\`.

If you want to see the leaderboard, ask me \`leaderboard\`.
    `
      );
    }
  );
};

const listens = controller => {
  forTaco(controller);
  forReaction(controller);
  forScore(controller);
  forUser(controller);
  forLeft(controller);
  forHelp(controller);
};

module.exports = {
  listens
};
