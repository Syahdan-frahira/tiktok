const TelegramBot = require('node-telegram-bot-api');
const chalk = require('chalk');
const axios = require('axios');
const { BOT_TOKEN, AI_API_URL, AI_SYSTEM_PROMPT } = require('./config');
const { version } = require('./package.json');
const handler = require('./handler');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
let Start = new Date();

const userLanguage = {};
const conversationHistory = {};

// Fungsi untuk cek private chat
const isPrivateChat = (msg) => {
  return msg.chat.type === 'private';
};

// Banner
const displayBanner = () => {
  console.log(chalk.yellow.bold('TikTok Downloader Bot with Enhanced AI Assistant'));
  console.log(chalk.cyan('========================================'));
};

// Logs
const logs = (type, message, details = {}) => {
  const timestamp = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
  let color, prefix;

  switch (type.toLowerCase()) {
    case 'info':
      color = chalk.cyan;
      prefix = '[INFO]';
      break;
    case 'success':
      color = chalk.green;
      prefix = '[SUCCESS]';
      break;
    case 'error':
      color = chalk.red;
      prefix = '[ERROR]';
      break;
    case 'warning':
      color = chalk.yellow;
      prefix = '[WARNING]';
      break;
    default:
      color = chalk.white;
      prefix = '[LOG]';
  }

  const logMessage = `${prefix} [${timestamp}] ${message}`;
  const detailLines = Object.entries(details)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join('\n');

  console.log(color(logMessage));
  if (detailLines) console.log(color(detailLines));
};

displayBanner();
logs('info', 'Bot started', { Token: BOT_TOKEN.slice(0, 10) + '...' });

// Polling Error
bot.on('polling_error', (error) => {
  logs('error', 'Polling error', { Error: error.message });
});

// Set Bot Commands
bot.setMyCommands([
  { command: '/start', description: 'Start the bot' },
  { command: '/help', description: 'View usage guide' },
  { command: '/runtime', description: 'Check bot uptime' },
]);

// Language
const getMessage = (lang, type) => {
  const messages = {
    id: {
      start: `
🌟 Selamat datang di *TikTok Downloader Bot*! 🌟
Saya akan membantu Anda mengunduh video, audio, atau foto TikTok tanpa watermark. Kirim **Hanya** tautan TikTok yang valid, seperti:
https://vt.tiktok.com/ZS2qsMU1W/
Jangan tambahkan teks lain sebelum atau sesudah tautan.

📌 *Cara Mendapatkan Tautan*:
1. Buka aplikasi TikTok.
2. Pilih video atau foto.
3. Ketuk *Bagikan* (panah ke kanan).
4. Pilih *Salin Tautan*.
5. Tempel **Hanya** tautan di sini.

Kirim **Hanya** tautan TikTok sekarang! Atau ketik /help untuk panduan lebih lanjut.
Pilih bahasa: *id*, *en*, atau *zh*`,
      help: `
📚 *Panduan Penggunaan Bot* 📚
Saya di sini untuk membantu Anda mengunduh konten TikTok. Kirim **Hanya** tautan TikTok tanpa teks tambahan, seperti:
https://vt.tiktok.com/ZS2qsMU1W/

✨ *Fitur*:
- Unduh video TikTok tanpa watermark.
- Unduh audio atau foto/slideshow.
- Gunakan /runtime untuk cek waktu aktif bot.

📌 *Cara Mengunduh*:
1. Buka TikTok, pilih video/foto.
2. Ketuk *Bagikan* > *Salin Tautan*.
3. Tempel **Hanya** tautan di sini.

💡 *Penting*:
- Jangan tambahkan teks sebelum/sesudah tautan.
- Jika ada masalah, saya akan membantu!

Kirim **Hanya** tautan TikTok sekarang! Atau pilih bahasa: *id*, *en*, atau *zh*`,
      runtime: '🕒 Bot sudah aktif selama: {hours} jam, {minutes} menit, {seconds} detik.',
      invalid_url: `
Maaf, tautan yang Anda kirim bukan tautan TikTok yang valid. Pastikan tautan dari TikTok, seperti:
https://vt.tiktok.com/ZS2qsMU1W/
Kirim **Hanya** tautan tanpa teks tambahan.

📌 *Cara Memperbaiki*:
1. Buka aplikasi TikTok.
2. Pilih video/foto, ketuk *Bagikan*.
3. Salin tautan.
4. Tempel **Hanya** tautan di sini.

Kirim **Hanya** tautan TikTok yang valid sekarang!`,
      strict_link_only: `
Maaf, Anda **Hanya** boleh mengirim tautan TikTok tanpa teks tambahan, seperti:
https://vt.tiktok.com/ZS2qsMU1W/
Jangan tambahkan teks sebelum atau sesudah tautan.

📌 *Cara Memperbaiki*:
1. Buka aplikasi TikTok.
2. Pilih video/foto, ketuk *Bagikan*.
3. Salin tautan.
4. Tempel **Hanya** tautan di sini.

Kirim **Hanya** tautan TikTok sekarang!`,
      processing: '⏳ Sedang memproses tautan TikTok Anda... Tunggu sebentar, ya!',
      processing_error: `
Maaf, ada masalah saat memproses tautan Anda. Mungkin tautan salah atau ada masalah jaringan.

📌 *Cara Memperbaiki*:
1. Pastikan tautan dari TikTok, seperti:
   https://vt.tiktok.com/ZS2qsMU1W/
2. Salin ulang tautan.
3. Tempel **Hanya** tautan tanpa teks tambahan.

Kirim **Hanya** tautan TikTok sekarang! Atau tanya saya tentang cara mengunduh.`,
      off_topic: `
Saya di sini untuk membantu mengunduh video, audio, atau foto TikTok. Kirim **Hanya** tautan TikTok atau tanya tentang fitur bot!

📌 *Cara Mulai*:
1. Buka TikTok, pilih video/foto.
2. Ketuk *Bagikan* > *Salin Tautan*.
3. Tempel **Hanya** tautan di sini.

Kirim **Hanya** tautan TikTok sekarang!`,
    },
    en: {
      start: `
🌟 Welcome to *TikTok Downloader Bot*! 🌟
I’m here to help you download TikTok videos, audio, or photos without watermarks. Send **ONLY** a valid TikTok link, like:
https://vt.tiktok.com/ZS2qsMU1W/
Do not include any text before or after the link.

📌 *How to Get the Link*:
1. Open the TikTok app.
2. Choose a video or photo.
3. Tap *Share* (right arrow).
4. Select *Copy Link*.
5. Paste **ONLY** the link here.

Send **ONLY** a TikTok link now! Or type /help for more guidance.
Choose language: *id*, *en*, or *zh*`,
      help: `
📚 *How to Use the Bot* 📚
I’m here to help you download TikTok content. Send **ONLY** a TikTok link without extra text, like:
https://vt.tiktok.com/ZS2qsMU1W/

✨ *Features*:
- Download TikTok videos without watermarks.
- Download audio or photo/slideshows.
- Use /runtime to check bot uptime.

📌 *How to Download*:
1. Open TikTok, select a video/photo.
2. Tap *Share* > *Copy Link*.
3. Paste **ONLY** the link here.

💡 *Important*:
- Do not add text before/after the link.
- If there’s an issue, I’ll help troubleshoot!

Send **ONLY** a TikTok link now! Or choose language: *id*, *en*, or *zh*`,
      runtime: '🕒 Bot has been active for: {hours} hours, {minutes} minutes, {seconds} seconds.',
      invalid_url: `
Sorry, the link you sent isn’t a valid TikTok link. Ensure it’s from TikTok, like:
https://vt.tiktok.com/ZS2qsMU1W/
Send **ONLY** the link without extra text.

📌 *How to Fix*:
1. Open the TikTok app.
2. Choose a video/photo, tap *Share*.
3. Copy the link.
4. Paste **ONLY** the link here.

Send **ONLY** a valid TikTok link now!`,
      strict_link_only: `
Sorry, you must send **ONLY** the TikTok link without extra text, like:
https://vt.tiktok.com/ZS2qsMU1W/
Do not add text before or after the link.

📌 *How to Fix*:
1. Open the TikTok app.
2. Choose a video/photo, tap *Share*.
3. Copy the link.
4. Paste **ONLY** the link here.

Send **ONLY** the TikTok link now!`,
      processing: '⏳ Processing your TikTok link... Please wait a moment!',
      processing_error: `
Sorry, there was an issue processing your link. It could be an invalid link or network issue.

📌 *How to Fix*:
1. Ensure the link is from TikTok, like:
   https://vt.tiktok.com/ZS2qsMU1W/
2. Copy the link again.
3. Paste **ONLY** the link without extra text.

Send **ONLY** a TikTok link now! Or ask me about downloading.`,
      off_topic: `
I’m here to assist with downloading TikTok videos, audio, or photos. Send **ONLY** a TikTok link or ask about the bot’s features!

📌 *How to Start*:
1. Open TikTok, select a video/photo.
2. Tap *Share* > *Copy Link*.
3. Paste **ONLY** the link here.

Send **ONLY** a TikTok link now!`,
    },
    zh: {
      start: `
🌟 欢迎使用 *TikTok下载机器人*! 🌟
我将帮助您下载TikTok的无水印视频、音频或照片。请**仅**发送有效的TikTok链接，例如：
https://vt.tiktok.com/ZS2qsMU1W/
不要在链接前后添加任何文本。

📌 *如何获取链接*：
1. 打开TikTok应用程序。
2. 选择视频或照片。
3. 点击*分享*按钮（右箭头）。
4. 选择*复制链接*。
5. 在这里**仅**粘贴链接。

现在**仅**发送TikTok链接！或输入 /help 获取更多指导。
选择语言：*id*、*en* 或 *zh*`,
      help: `
📚 *如何使用机器人* 📚
我在这里帮助您下载TikTok内容。请**仅**发送TikTok链接，不带额外文本，例如：
https://vt.tiktok.com/ZS2qsMU1W/

✨ *功能*：
- 下载无水印TikTok视频。
- 下载音频或照片/幻灯片。
- 使用 /runtime 检查机器人运行时间。

📌 *如何下载*：
1. 打开TikTok，选择视频/照片。
2. 点击*分享* > *复制链接*。
3. 在这里**仅**粘贴链接。

💡 *重要提示*：
- 不要在链接前后添加文本。
- 如有问题，我会帮助解决！

现在**仅**发送TikTok链接！或选择语言：*id*、*en* 或 *zh*`,
      runtime: '🕒 机器人已运行：{hours}小时，{minutes}分钟，{seconds}秒。',
      invalid_url: `
抱歉，您发送的链接不是有效的TikTok链接。请确保链接来自TikTok，例如：
https://vt.tiktok.com/ZS2qsMU1W/
**仅**发送链接，不带额外文本。

📌 *如何修复*：
1. 打开TikTok应用程序。
2. 选择视频/照片，点击*分享*。
3. 复制链接。
4. 在这里**仅**粘贴链接。

现在**仅**发送有效的TikTok链接！`,
      strict_link_only: `
抱歉，您必须**仅**发送TikTok链接，不带额外文本，例如：
https://vt.tiktok.com/ZS2qsMU1W/
不要在链接前后添加文本。

📌 *如何修复*：
1. 打开TikTok应用程序。
2. 选择视频/照片，点击*分享*。
3. 复制链接。
4. 在这里**仅**粘贴链接。

现在**仅**发送TikTok链接！`,
      processing: '⏳ 正在处理您的TikTok链接... 请稍等！',
      processing_error: `
抱歉，处理您的链接时出现问题。可能是链接无效或网络问题。

📌 *如何修复*：
1. 确保链接来自TikTok，例如：
   https://vt.tiktok.com/ZS2qsMU1W/
2. 再次复制链接。
3. **仅**粘贴链接，不带额外文本。

现在**仅**发送TikTok链接！或询问我关于下载的问题。`,
      off_topic: `
我在这里帮助下载TikTok视频、音频或照片。请**仅**发送TikTok链接或询问机器人功能！

📌 *如何开始*：
1. 打开TikTok，选择视频/照片。
2. 点击*分享* > *复制链接*。
3. 在这里**仅**粘贴链接。

现在**仅**发送TikTok链接！`,
    },
  };
  return messages[lang][type];
};

// Inline Keyboard 
const getMainKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🇮🇩 Indonesia', callback_data: 'lang_id' },
        { text: '🇬🇧 English', callback_data: 'lang_en' },
        { text: '🇨🇳 Chinese', callback_data: 'lang_zh' },
      ],
      [
        { text: '⏰ Runtime', callback_data: 'runtime' },
        { text: '📖 Guide', callback_data: 'help' },
      ],
      [{ text: '📬 Support', url: 'https://instagram.com/syhdnfrahira' }],
    ],
  },
});

// AI Request sesuai AI_SYSTEM_PROMPT
async function queryAI(chatId, userMessage, lang = 'id') {
  try {
    if (!conversationHistory[chatId]) {
      conversationHistory[chatId] = [
        {
          role: 'system',
          content: `
${AI_SYSTEM_PROMPT}
Respond in ${lang === 'id' ? 'Indonesian' : lang === 'en' ? 'English' : 'Chinese'} with a fun, engaging, and professional tone as a TikTok Downloader Bot assistant. Use emojis to make responses lively, but stay strictly focused on TikTok downloading, features, or commands. If the user asks unrelated questions, redirect politely to TikTok topics, emphasizing the link-only rule or bot features.
`,
        },
      ];
    }

    // History Messages
    conversationHistory[chatId].push({
      role: 'user',
      content: userMessage,
    });

    if (conversationHistory[chatId].length > 9999000) {
      conversationHistory[chatId] = [
        conversationHistory[chatId][0],
        ...conversationHistory[chatId].slice(-8999999),
      ];
    }

    const response = await axios.post(
      AI_API_URL,
      {
        messages: conversationHistory[chatId],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `TeleBot/${version}`,
          accept: 'application/json',
        },
        timeout: 60000,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const ai_response = response.data.content;
    conversationHistory[chatId].push({
      role: 'assistant',
      content: ai_response,
    });

    return ai_response;
  } catch (error) {
    logs('error', 'AI API request failed', {
      ChatID: chatId,
      Error: error.message,
    });
    return getMessage(lang, 'processing_error');
  }
}

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const lang = userLanguage[chatId] || 'id';

  try {
    let newText = null;
    let newMarkup = null;

    if (data.startsWith('lang_')) {
      const newLang = data.split('_')[1];
      if (newLang !== userLanguage[chatId]) {
        userLanguage[chatId] = newLang;
        newText = getMessage(newLang, 'start');
        newMarkup = getMainKeyboard();
        if (conversationHistory[chatId]) {
          conversationHistory[chatId][0].content = `
${AI_SYSTEM_PROMPT}
Respond in ${newLang === 'id' ? 'Indonesian' : newLang === 'en' ? 'English' : 'Chinese'} with a fun, engaging, and professional tone as a TikTok Downloader Bot assistant. Use emojis to make responses lively, but stay strictly focused on TikTok downloading, features, or commands. If the user asks unrelated questions, redirect politely to TikTok topics, emphasizing the link-only rule or bot features.
`;
        }
        logs('info', 'Language changed', { ChatID: chatId, Language: newLang });
      }
    } else if (data === 'runtime') {
      const now = new Date();
      const uptimeMilliseconds = now - Start;
      const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);

      newText = getMessage(lang, 'runtime')
        .replace('{hours}', uptimeHours)
        .replace('{minutes}', uptimeMinutes % 60)
        .replace('{seconds}', uptimeSeconds % 60);
      newMarkup = {};
      logs('info', 'Runtime checked via button', { ChatID: chatId, Uptime: newText });
    } else if (data === 'help') {
      newText = getMessage(lang, 'help');
      newMarkup = getMainKeyboard();
      logs('info', 'Help requested via button', { ChatID: chatId });
    }

    if (newText) {
      await bot.editMessageText(newText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: newMarkup,
      });
    } else {
      await bot.editMessageReplyMarkup(
        { reply_markup: {} },
        { chat_id: chatId, message_id: messageId }
      ).catch(() => {});
    }

    bot.answerCallbackQuery(query.id);
  } catch (error) {
    if (error.message.includes('message is not modified')) {
      bot.answerCallbackQuery(query.id);
      logs('warning', 'Message not modified, ignored', { ChatID: chatId, Error: error.message });
      return;
    }

    logs('error', 'Callback query failed', { ChatID: chatId, Error: error.message });
    await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
    bot.answerCallbackQuery(query.id);
  }
});

// Command Handlers
bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLanguage[chatId] || 'id';

  try {
    await bot.sendMessage(chatId, getMessage(lang, 'start'), {
      parse_mode: 'Markdown',
      ...getMainKeyboard(),
    });
    logs('info', 'Start command executed', { ChatID: chatId, Language: lang });
  } catch (error) {
    logs('error', 'Start command failed', { ChatID: chatId, Error: error.message });
    await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
  }
});

bot.onText(/^\/help$/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLanguage[chatId] || 'id';

  try {
    await bot.sendMessage(chatId, getMessage(lang, 'help'), {
      parse_mode: 'Markdown',
      ...getMainKeyboard(),
    });
    logs('info', 'Help command executed', { ChatID: chatId, Language: lang });
  } catch (error) {
    logs('error', 'Help command failed', { ChatID: chatId, Error: error.message });
    await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
  }
});


bot.onText(/^\/runtime$/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLanguage[chatId] || 'id';

  try {
    const now = new Date();
    const uptimeMilliseconds = now - Start;
    const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);

    const runtimeMessage = getMessage(lang, 'runtime')
      .replace('{hours}', uptimeHours)
      .replace('{minutes}', uptimeMinutes % 60)
      .replace('{seconds}', uptimeSeconds % 60);

    await bot.sendMessage(chatId, runtimeMessage, { parse_mode: 'Markdown' });
    logs('info', 'Runtime command executed', {
      ChatID: chatId,
      Uptime: runtimeMessage,
    });
  } catch (error) {
    logs('error', 'Runtime command failed', { ChatID: chatId, Error: error.message });
    await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
  }
});

// Penanganan pesan: Grup cuma terima command dan link TikTok, AI hanya di private
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '(no text)';
  const lang = userLanguage[chatId] || 'id';
  const isStrictTikTokUrl = text.match(/^https:\/\/.*tiktok\.com\/.+$/);

  logs('success', 'Message received', {
    ChatID: chatId,
    Text: text.length > 50 ? text.slice(0, 47) + '...' : text,
    Type: isStrictTikTokUrl && text === msg.text.trim() ? 'TikTok URL' : text.startsWith('/') ? 'Command' : 'Text',
  });

  try {
    if (isStrictTikTokUrl && text === msg.text.trim()) {
      if (!text.includes('vt.tiktok.com') && !text.includes('tiktok.com')) {
        await bot.sendMessage(chatId, getMessage(lang, 'invalid_url'), { parse_mode: 'Markdown' });
        logs('warning', 'Invalid TikTok URL', { ChatID: chatId, URL: text });
        return;
      }

      await bot.sendMessage(chatId, getMessage(lang, 'processing'), { parse_mode: 'Markdown' });
      try {
        await handler(bot, msg);
        logs('success', 'TikTok URL processed', { ChatID: chatId, URL: text });
      } catch (handlerError) {
        logs('error', 'Handler failed', { ChatID: chatId, Error: handlerError.message });
        await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
      }
    } else if (!text.startsWith('/')) {
      if (isPrivateChat(msg)) {
        if (isStrictTikTokUrl) {
          await bot.sendMessage(chatId, getMessage(lang, 'strict_link_only'), { parse_mode: 'Markdown' });
          logs('warning', 'Message contains extra text with TikTok URL', { ChatID: chatId, Text: text });
        } else {
          const ai_response = await queryAI(chatId, text, lang);
          await bot.sendMessage(chatId, ai_response, { parse_mode: 'Markdown' });
          logs('info', 'AI handled text message', {
            ChatID: chatId,
            Query: text.slice(0, 50),
            Response: ai_response.slice(0, 50),
          });
        }
      } else {
        // Di grup, abaikan pesan non-command dan non-link TikTok tanpa balasan
        logs('warning', 'Non-command/non-TikTok message in group ignored', { ChatID: chatId, Text: text });
        return;
      }
    }
  } catch (error) {
    logs('error', 'Message processing failed', { ChatID: chatId, Error: error.message });
    await bot.sendMessage(chatId, getMessage(lang, 'processing_error'), { parse_mode: 'Markdown' });
  }
});
