const Botkit = require("botkit");
const config = require("./config.js");
const taco = require("./taco.js");
const tacobot = require("./bot.js");
const schedule = require("node-schedule");

const controller = Botkit.slackbot(config.controller);
const bot = controller.spawn({
  token: config.token,
});

const startRTM = () => {
  bot.startRTM((err, _bot, _payload) => {
    if (err) {
      console.log(err);
      return setTimeout(startRTM, 60000);
    } else {
      console.log("Ready to taco !");
      taco.init();
      tacobot.listens(controller);
    }
  });
};

controller.on("rtm_close", function (_bot, _err) {
  process.exit();
});

startRTM();

schedule.scheduleJob({ hour: 07, minute: 00 }, () => {
  taco.resetLeft();
});
