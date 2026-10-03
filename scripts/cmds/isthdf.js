"use strict";

const targets = new Map();

module.exports = {
	config: {
		name: "استهداف",
		aliases: ["استهدف"],
		version: "1.0",
		author: "shtot",
		category: "fun",
		cooldown: 2,
		role: 0
	},

	onStart: async function ({ api, event }) {
		// لازم يكون الأمر رد على صورة
		if (!event.messageReply) {
			return api.sendMessage(
				"❌ ردّ على الصورة اللي بغيتي تستعمل وكتب: استهداف",
				event.threadID
			);
		}

		const reply = event.messageReply;

		// استخراج ID ديال الشخص اللي رديتي على رسالتو
		const targetID = reply.senderID;

		if (!targetID) {
			return api.sendMessage("❌ مقدرتش نحدد صاحب الرسالة.", event.threadID);
		}

		// استخراج رابط الصورة
		let imageURL = null;

		if (reply.attachments && reply.attachments.length > 0) {
			const attachment = reply.attachments.find(
				a => a.type === "photo" || a.type === "animated_image"
			);

			if (attachment) {
				imageURL = attachment.url;
			}
		}

		if (!imageURL) {
			return api.sendMessage(
				"❌ خاصك ترد على رسالة فيها صورة.",
				event.threadID
			);
		}

		targets.set(targetID, {
			threadID: event.threadID,
			imageURL: imageURL
		});

		return api.sendMessage(
			`🎯 تم استهداف الشخص بنجاح!\n\n🆔 ID: ${targetID}\n📸 أي رسالة يرسلها غادي نرد عليها بنفس الصورة.\n\n🛑 للإيقاف: رد على رسالة ديالو وكتب "إيقاف"`,
			event.threadID
		);
	},

	onChat: async function ({ api, event }) {
		const senderID = event.senderID;

		// ما كاينش استهداف لهذا الشخص
		if (!targets.has(senderID)) return;

		const data = targets.get(senderID);

		// إذا كتب إيقاف، نحيد الاستهداف
		const body = (event.body || "").trim().toLowerCase();

		if (body === "إيقاف" || body === "ايقاف") {
			targets.delete(senderID);

			return api.sendMessage(
				"🛑 تم إيقاف الاستهداف لهذا الشخص.",
				event.threadID
			);
		}

		// إرسال نفس الصورة
		try {
			return api.sendMessage(
				{
					attachment: await global.utils.getStreamFromURL(data.imageURL)
				},
				event.threadID
			);
		} catch (err) {
			console.error(err);

			return api.sendMessage(
				"❌ وقع مشكل في إرسال الصورة.",
				event.threadID
			);
		}
	}
};
