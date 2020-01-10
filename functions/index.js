const functions = require("firebase-functions");

const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const fetch = require("node-fetch");

let config = require("./env.json");

if (Object.keys(functions.config()).length) {
  config = functions.config();
}

/**
 * Get json fuflomycin data from github
 */
const getDataFromGithub = async () => {
  //
  const HOMEOPATHY_URL =
    "https://fuflomycin.github.io/fuflomycin/homeopathy.json";
  const RSP_URL = "https://fuflomycin.github.io/fuflomycin/rsp.json";
  const FK_URL = "https://fuflomycin.github.io/fuflomycin/fk.json";

  console.log("Try get data fron Github...");
  let result = [];

  const rawHomeopathy = await fetch(HOMEOPATHY_URL);
  const homeopathy = await rawHomeopathy.json();
  for (let i in homeopathy) result.push({ i, ...homeopathy[i] });

  const rawRsp = await fetch(RSP_URL);
  const rsp = await rawRsp.json();
  for (let i in rsp) result.push({ i, ...rsp[i] });

  const rawFk = await fetch(FK_URL);
  const fk = await rawFk.json();
  for (let i in fk) result.push({ i, ...fk[i] });

  for (let i in result) {
    result[i].index = (
      result[i].title +
      ", " +
      result[i].other.join(", ")
    ).toLocaleUpperCase();
    result[i].otherstr = result[i].other.join(", ");
  }

  //
  result.sort((a, b) => {
    if (a.title.toLocaleUpperCase() > b.title.toLocaleUpperCase()) return 1;
    if (a.title.toLocaleUpperCase() < b.title.toLocaleUpperCase()) return -1;
    return 0;
  });

  return result;
};

const bot = new Telegraf(config.service.bot_token);

/**
 * Start message
 */
bot.start(ctx =>
  ctx.reply("Бот для поиска препаратов по базе фуфломицинов и гомеопатии.")
);

/**
 * Help message
 */
bot.help(ctx =>
  ctx.reply("Напишите название препарата или действующего вещества")
);

/**
 *
 */
(async () => {
  const drugs = await getDataFromGithub();
  bot.command("count", ({ reply }) =>
    reply("Препаратов в базе: " + drugs.length)
  );
  bot.use(({ message, replyWithHTML, reply }) => {
    console.log(message);
    const prompt = message.text;
    const p = prompt.toLocaleUpperCase();
    const result = drugs.filter(i => i.index.includes(p));
    if (result.length > 1) {
      reply(
        "Много результатов, уточните: " + result.length,

        Extra.markup(Markup.keyboard(result.map(i => i.title)))
      );
    } else if (result.length === 1) {
      replyWithHTML(
        "<b>" +
          result[0].title +
          "</b>\n" +
          (result[0].otherstr.length > 0
            ? "<i>" + result[0].otherstr + "</i>\n"
            : "") +
          result[0].section +
          "\n\n" +
          result[0].contents.replace(/<p>/g, "").replace(/<\/p>/g, "\n")
      );
      reply();
    }
  });
})();

bot.hears("hi", ctx => ctx.reply("Hey there"));

/**
 * Start bot
 */
bot.launch();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
