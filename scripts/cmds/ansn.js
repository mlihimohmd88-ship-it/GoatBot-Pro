"use strict";

const targets = new Map();

module.exports = {
  config: {
    name: "antiout",
    aliases: ["ao"],
    version: "1.0",
    author: "shtot",
    category: "group",
    role: 1,
    cooldown: 3
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;

    // antiout off
    if (args[0] === "off") {
      targets.delete(threadID);

      return api.sendMessage(
        "❌ تم إيقاف AntiOut في هذه المجموعة.",
        threadID
      );
    }

    // antiout ID
    if (!args[0]) {
      return api.sendMessage(
        "❌ الاستعمال:\n\nantiout <ID>\nantiout off",
        threadID
      );
    }

    const userID = args[0].trim();

    targets.set(threadID, userID);

    return api.sendMessage(
      `✅ تم تفعيل AntiOut.\n\n👤 ID المستهدف: ${userID}\n\nإذا تم إخراجه من المجموعة، سيحاول البوت إرجاعه تلقائياً.`,
      threadID
    );
  },

  onEvent: async function ({ api, event }) {
    if (event.logMessageType !== "log:unsubscribe")
      return;

    const threadID = event.threadID;
    const targetID = targets.get(threadID);

    if (!targetID)
      return;

    const data = event.logMessageData || {};

    // العضو الذي تم إخراجه
    const removedID =
      data.leftParticipantFbId ||
      data.kickedParticipantFbId;

    if (!removedID)
      return;

    // واش هو الشخص اللي حددناه؟
    if (String(removedID) !== String(targetID))
      return;

    /*
      author = الشخص الذي تسبب في حدث الإزالة.
      إذا كان هو نفس الشخص الذي خرج، فهذا يعني أنه خرج بنفسه.
      في هذه الحالة لا نحاول إرجاعه.
    */
    const authorID = data.author;

    if (
      authorID &&
      String(authorID) === String(removedID)
    ) {
      return;
    }

    try {
      await api.addUserToGroup(
        targetID,
        threadID
      );

      return api.sendMessage(
        `🔄 AntiOut\n\nتم إخراج العضو ${targetID}.\n✅ حاولت إرجاعه إلى المجموعة.`,
        threadID
      );

    } catch (error) {
      console.log(
        "[AntiOut Error]",
        error
      );
    }
  }
};
