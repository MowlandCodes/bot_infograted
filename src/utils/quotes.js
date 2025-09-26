// src/utils/quotes.js

// Kumpulan quotes
const quotes = [
  "Jangan menyerah, setiap langkah kecil membawa kita lebih dekat ke tujuan.",
  "Kesuksesan adalah hasil dari usaha yang konsisten, bukan keberuntungan semata.",
];

// Fungsi ambil random quote
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

// Fungsi kirim quotes ke grup
export async function sendDailyQuote(bot, groupJid) {
  const quote = getRandomQuote();
  await bot.sendMessage(groupJid, { text: `🌟 Daily Quote 🌟\n\n"${quote}"` });
}
