"use strict";

const activeGroups = new Set();
const registeredApis = new WeakSet();

module.exports = {
  config: {
    name: "إرجاع",
    aliases: ["رجع", "ارجاع"],
    version: "1.0",
    author: "shtot",
    category: "group",
    role: 1,
    cooldown: 3
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;

    if (args[0] === "off" || args[0] === "إيقاف") {
      activeGroups.delete(threadID);

      return api.sendMessage(
        "❌ تم إيقاف نظام الإرجاع.",
        threadID
      );
    }

    activeGroups.add(threadID);

    if (!registeredApis.has(api)) {
      registeredApis.add(api);

      api.listenMqtt(async (err, ev) => {
        if (err || !ev) return;

        if (ev.logMessageType !== "log:unsubscribe")
          return;

        const groupID = ev.threadID;

        if (!activeGroups.has(groupID))
          return;

        const data = ev.logMessageData || {};

        const removedID =
          data.leftParticipantFbId ||
          data.kickedParticipantFbId;

        if (!removedID)
          return;

        // لا يرجع البوت نفسه
        if (
          String(removedID) ===
          String(api.getCurrentUserID())
        ) {
          return;
        }

        try {
          await api.addUserToGroup(
            String(removedID),
            groupID
          );

          await api.sendMessage(
            "رجع زلالك سحتوت مبغاشك تخرج🍆👌🏻",
            groupID
          );

        } catch (error) {
          console.log("[إرجاع Error]", error);
        }
      });
    }

    return api.sendMessage(
      "✅ تم تشغيل نظام الإرجاع.\n\nأي عضو يتم إخراجه، سيحاول البوت إرجاعه تلقائياً.",
      threadID
    );
  }
};
