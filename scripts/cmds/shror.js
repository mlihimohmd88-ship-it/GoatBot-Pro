"use strict";

module.exports = {
  config: {
    name: "antiremove",
    aliases: ["antirk", "antiout"],
    version: "1.0",
    author: "shtot",
    category: "group",
    role: 1,
    cooldown: 3
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;

    if (!global.antiremove)
      global.antiremove = new Map();

    if (args[0] === "on") {
      global.antiremove.set(threadID, true);
      return api.sendMessage(
        "✅ تم تشغيل AntiRemove\nأي عضو يتم إخراجه من المجموعة سيحاول البوت إرجاعه.",
        threadID
      );
    }

    if (args[0] === "off") {
      global.antiremove.delete(threadID);
      return api.sendMessage(
        "❌ تم إيقاف AntiRemove.",
        threadID
      );
    }

    return api.sendMessage(
      "الاستخدام:\n.antiremove on\n.antiremove off",
      threadID
    );
  },

  onEvent: async function ({ api, event }) {
    if (!global.antiremove?.has(event.threadID))
      return;

    if (event.logMessageType !== "log:unsubscribe")
      return;

    const data = event.logMessageData;
    if (!data) return;

    const removedID = data.leftParticipantFbId;

    if (!removedID) return;

    // إذا كان البوت هو اللي خرج، لا تحاول ترجعه
    if (removedID === api.getCurrentUserID())
      return;

    try {
      await api.addUserToGroup(removedID, event.threadID);

      api.sendMessage(
        `🔄 تم إخراج عضو من المجموعة.\nتمت محاولة إرجاعه تلقائياً.`,
        event.threadID
      );
    } catch (err) {
      console.log("AntiRemove Error:", err);
    }
  }
};
