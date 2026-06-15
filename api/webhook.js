const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');

const token = '8344281420:AAE3213UPy7nJ1szWYNEvhINrXRUE9DLpUI';
const adminId = 7340265605;
const bot = new TelegramBot(token);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Server bot aktif');
    }

    const update = req.body;

    try {
        if (update.message) {
            const chatId = update.message.chat.id;

            if (chatId !== adminId) {
                await bot.sendMessage(chatId, "Akses ditolak");
                return res.status(200).send('OK');
            }

            if (update.message.text === '/start') {
                const keyboard = {
                    inline_keyboard: [
                        [{ text: 'Update Foto Profil', callback_data: 'menu_update' }]
                    ]
                };
                await bot.sendMessage(chatId, "Selamat datang di Admin Panel MPK SMAN 3 Cilacap. Pilih menu di bawah", { reply_markup: keyboard });
            }

            if (update.message.photo && update.message.reply_to_message) {
                const textBalasan = update.message.reply_to_message.text;

                if (textBalasan.includes("Kirim foto profil baru untuk")) {
                    const namaPengurus = textBalasan.split("untuk")[1].trim();

                    await bot.sendMessage(chatId, `Mengunggah foto untuk ${namaPengurus}`);

                    const fileId = update.message.photo[update.message.photo.length - 1].file_id;
                    const fileUrl = await bot.getFileLink(fileId);

                    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');

                    const formData = new FormData();
                    formData.append('image', buffer.toString('base64'));

                    const imgbbRes = await axios.post('https://api.imgbb.com/1/upload?key=e8b3b7bbba9d922a90099684c798ce0a', formData, {
                        headers: formData.getHeaders()
                    });

                    const publicUrl = imgbbRes.data.data.url;

                    await bot.sendMessage(chatId, `Berhasil mengunggah foto untuk ${namaPengurus}\n\nURL Publik\n${publicUrl}\n\nMasukkan URL ini ke kode HTML website Anda atau simpan ke Vercel Database`);
                }
            }
        }

        if (update.callback_query) {
            const chatId = update.callback_query.message.chat.id;
            const data = update.callback_query.data;

            if (data === 'menu_update') {
                const keyboard = {
                    inline_keyboard: [
                        [{ text: 'Athif Zhafir Arkandafi', callback_data: 'upd_Athif Zhafir Arkandafi' }],
                        [{ text: 'Raden Citorizqi Arvendhin T', callback_data: 'upd_Raden Citorizqi' }]
                    ]
                };
                await bot.sendMessage(chatId, "Pilih pengurus yang ingin diperbarui", { reply_markup: keyboard });
            }

            if (data.startsWith('upd_')) {
                const nama = data.replace('upd_', '');
                await bot.sendMessage(chatId, `Kirim foto profil baru untuk ${nama}\n\nAnda harus membalas pesan ini dengan foto yang ingin diunggah`, {
                    reply_markup: { force_reply: true }
                });
            }
        }
    } catch (error) {
        console.error(error);
    }

    res.status(200).send('OK');
}
