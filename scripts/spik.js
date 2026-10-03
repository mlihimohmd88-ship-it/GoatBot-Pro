"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "gffTarget.json");

if (!fs.existsSync(DATA_DIR))
	fs.mkdirSync(DATA_DIR, { recursive: true });

function loadData() {
	try {
		if (!fs.existsSync(DATA_FILE)) return {};
		return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
	} catch {
		return {};
	}
}

function saveData(data) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
	config: {
		name: "gff",
		aliases: [],
		version: "1.0",
		author: "shtot",
		category: "fun",
		cooldown: 2,
		role: 0
	},

	onStart: async function ({ message, event, args }) {
		const data = loadData();
		const threadID = event.threadID;

		// إيقاف الاستهداف
		if (
			args[0] === "وقف" ||
			args[0] === "stop" ||
			args[0] === "off"
		) {
			if (!data[threadID]) {
				return message.reply("❌ ما كاين حتى استهداف خدام.");
			}

			if (data[threadID].imagePath) {
				try {
					if (fs.existsSync(data[threadID].imagePath))
						fs.unlinkSync(data[threadID].imagePath);
				} catch {}
			}

			delete data[threadID];
			saveData(data);

			return message.reply("✅ تم إيقاف استهداف gff.");
		}

		// خاص يكون الأمر Reply على صورة
		if (!event.messageReply) {
			return message.reply(
				"❌ ردّ على صورة وكتب:\n\ngff ID\n\nمثال:\ngff 1000123456789"
			);
		}

		const reply = event.messageReply;

		if (!reply.attachments || reply.attachments.length === 0) {
			return message.reply("❌ خاصك ترد على صورة.");
		}

		const image = reply.attachments.find(
			a => a.type === "photo" || a.type === "image"
		);

		if (!image || !image.url) {
			return message.reply("❌ ما لقيتش صورة فهاد الرسالة.");
		}

		const targetID = args[0];

		if (!targetID || !/^\d+$/.test(targetID)) {
			return message.reply(
				"❌ حط ID ديال الشخص.\n\nمثال:\ngff 1000123456789"
			);
		}

		const imagePath = path.join(
			DATA_DIR,
			`gff_${threadID}.jpg`
		);

		try {
			const response = await axios.get(image.url, {
				responseType: "arraybuffer"
			});

			fs.writeFileSync(imagePath, response.data);

			data[threadID] = {
				targetID: String(targetID),
				imagePath: imagePath,
				enabled: true
			};

			saveData(data);

			return message.reply(
				`🎯 تم تشغيل gff بنجاح.\n\n👤 ID المستهدف: ${targetID}\n🖼️ تم حفظ الصورة.\n\nأي رسالة من الشخص غادي يرد عليها البوت بالصورة.`
			);
		} catch (error) {
			console.error(error);
			return message.reply("❌ وقع مشكل أثناء حفظ الصورة.");
		}
	},

	onChat: async function ({ event, api }) {
		const data = loadData();
		const target = data[event.threadID];

		if (!target || !target.enabled) return;

		// غير الشخص المستهدف
		if (String(event.senderID) !== String(target.targetID))
			return;

		// الصورة خاصها تكون موجودة
		if (!fs.existsSync(target.imagePath))
			return;

		try {
			await api.sendMessage(
				{
					body: "",
					attachment: fs.createReadStream(target.imagePath)
				},
				event.threadID,
				undefined,
				event.messageID
			);
		} catch (error) {
			console.error("GFF Error:", error);
		}
	}
};
