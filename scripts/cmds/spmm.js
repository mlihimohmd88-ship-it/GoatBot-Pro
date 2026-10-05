"use strict";

const tasks = new Map();

module.exports = {
  config: {
    name: "hwii",
    aliases: [],
    version: "1.0.0",
    author: "shtot",
    countDown: 2,
    role: 0,
    shortDescription: "تكرار رسالة كل ثانية",
    category: "fun"
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadID;

    // إيقاف
    if (
      args[0] &&
      ["stop", "وقف", "توقيف"].includes(
        String(args[0]).toLowerCase()
      )
    ) {
      const task = tasks.get(threadID);

      if (!task) {
        return message.reply("❌ ماكاين حتى Hwii خدام.");
      }

      task.stop = true;

      if (task.timer) {
        clearTimeout(task.timer);
      }

      tasks.delete(threadID);

      return message.reply("🛑 تم توقيف Hwii.");
    }

    if (!args.length) {
      return message.reply(
        "❌ كتب الرسالة.\n\nمثال:\n-hwii سلام\n\nللإيقاف:\n-hwii stop"
      );
    }

    if (tasks.has(threadID)) {
      return message.reply(
        "⚠️ كاين Hwii خدام دابا.\n\nاستعمل:\n-hwii stop"
      );
    }

    const text = args.join(" ").trim();

    const task = {
      stop: false,
      timer: null,
      busy: false
    };

    tasks.set(threadID, task);

    await message.reply(
      "🚀 بدا Hwii\n\n" +
      "📝 الرسالة: " + text + "\n" +
      "⏱️ كل ثانية\n\n" +
      "🛑 للإيقاف: -hwii stop"
    );

    async function sendLoop() {
      if (task.stop) return;

      if (!task.busy) {
        task.busy = true;

        try {
          await api.sendMessage(text, threadID);
        } catch (error) {
          // خطأ واحد ما يوقفش الحلقة
        }

        task.busy = false;
      }

      if (!task.stop) {
        task.timer = setTimeout(sendLoop, 1000);
      }
    }

    task.timer = setTimeout(sendLoop, 1000);
  }
};
