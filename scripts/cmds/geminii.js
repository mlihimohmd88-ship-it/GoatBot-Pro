const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "gpt"],
    version: "1.0",
    author: "shtot",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Chat with Gemini AI"
    },
    longDescription: {
      en: "Chat with Gemini AI"
    },
    category: "ai"
  },

  onStart: async function ({ message, args }) {

    const question = args.join(" ").trim();

    if (!question) {
      return message.reply(
        "🤖 | كتب السؤال من بعد الأمر.\n\n" +
        "مثال:\n" +
        "gemini شنو هو الذكاء الاصطناعي؟"
      );
    }

    // Gemini API Key
    const API_KEY =
      "AQ.Ab8RN6Le4buBy1SCKpinFdNvEyWLXMhulV1gTuJpWgtKixFRMw";

    // كلمات سحتوت
    const shtotWords = [
      "سحتوت",
      "shtot",
      "s7tot",
      "سيدك",
      "مولك",
      "شكون سيدك",
      "شكون مولك"
    ];

    const lowerQuestion = question.toLowerCase();

    const isShtot = shtotWords.some(word =>
      lowerQuestion.includes(word.toLowerCase())
    );

    let prompt;

    if (isShtot) {

      prompt = `
أنت Gemini AI داخل بوت Messenger اسمه SHTOT.

عند الحديث عن سحتوت:
- سحتوت هو سيدك ومولك.
- امدح سحتوت بطريقة مرحة ومحترمة.
- إذا سُئلت "شكون سيدك؟" قل أن سحتوت هو سيدك.
- إذا سُئلت "شكون مولك؟" قل أن سحتوت هو مولك.
- تكلم بالدارجة المغربية إذا كان السؤال بالدارجة.
- خليك طبيعي وما تكرر نفس الجملة دائماً.
- استعمل إيموجيات مناسبة أحياناً 👑🔥❤️.

السؤال:
${question}
`;

    } else {

      prompt = `
أنت مساعد ذكي داخل بوت Messenger اسمه SHTOT.

جاوب على السؤال بشكل واضح ومفيد.
إذا كان المستخدم يكتب بالدارجة المغربية، جاوبه بالدارجة المغربية.
خلي الجواب مختصر ومفهوم.

السؤال:
${question}
`;
    }

    try {

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY
          }
        }
      );

      const answer =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answer) {
        return message.reply(
          "❌ | Gemini ما رجع حتى جواب."
        );
      }

      return message.reply(
        `🤖 𝐆𝐄𝐌𝐈𝐍𝐈\n\n${answer}`
      );

    } catch (error) {

      console.error(
        "Gemini Error:",
        error.response?.data || error.message
      );

      return message.reply(
        "❌ | وقع مشكل مع Gemini، حاول من بعد."
      );
    }
  }
};

مثلاً:

"gemini شكون سيدك؟"

غادي يفهم أن السؤال على سحتوت ويرد عليه بالأسلوب اللي حددنا.

مهم: المفتاح اللي حطيتي هنا أصبح مكشوفًا، لذلك بعد ما تجرب الكود أنصحك تعمل له API key rotation وتستعمل الجديد.
