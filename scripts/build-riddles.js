// Build script: combines all batches, deduplicates, assigns IDs, generates options
const fs = require('fs');
const path = require('path');

const batch1 = require('./riddles-raw.js');
const batch2 = require('./riddles-raw2.js');
const batch3 = require('./riddles-raw3.js');
const batch4 = require('./riddles-raw4.js');
const batch5 = require('./riddles-raw5.js');

const allRaw = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];
console.log(`Total raw riddles: ${allRaw.length}`);

// Deduplicate by question text (lowercase, trimmed)
const seen = new Set();
const unique = [];
for (const r of allRaw) {
    const key = r[0].toLowerCase().trim();
    if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
    }
}
console.log(`After dedup: ${unique.length}`);

// Distractor pools per category
const distractorPool = {
    hayvanlar: [
        { t: "Kedi", e: "🐱" }, { t: "Köpek", e: "🐶" }, { t: "Kuş", e: "🐦" }, { t: "Balık", e: "🐟" },
        { t: "Tavşan", e: "🐰" }, { t: "Kaplumbağa", e: "🐢" }, { t: "Kelebek", e: "🦋" }, { t: "Arı", e: "🐝" },
        { t: "Fil", e: "🐘" }, { t: "At", e: "🐴" }, { t: "Koyun", e: "🐑" }, { t: "Horoz", e: "🐓" },
        { t: "Salyangoz", e: "🐌" }, { t: "Yarasa", e: "🦇" }, { t: "Ahtapot", e: "🐙" }, { t: "Aslan", e: "🦁" },
        { t: "Penguen", e: "🐧" }, { t: "Maymun", e: "🐒" }, { t: "Timsah", e: "🐊" }, { t: "Yılan", e: "🐍" },
        { t: "Kartal", e: "🦅" }, { t: "Baykuş", e: "🦉" }, { t: "Sincap", e: "🐿️" }, { t: "Kurt", e: "🐺" },
        { t: "Fare", e: "🐭" }, { t: "Karınca", e: "🐜" }, { t: "Ördek", e: "🦆" }, { t: "Kirpi", e: "🦔" },
        { t: "Kuzu", e: "🐑" }, { t: "Tavuk", e: "🐔" }, { t: "Keçi", e: "🐐" }, { t: "Zebra", e: "🦓" },
        { t: "Zürafa", e: "🦒" }, { t: "Kaplan", e: "🐯" }, { t: "Geyik", e: "🦌" }, { t: "Kurbağa", e: "🐸" },
        { t: "Yunus", e: "🐬" }, { t: "Balina", e: "🐋" }, { t: "Flamingo", e: "🦩" }, { t: "Papağan", e: "🦜" },
    ],
    yiyecek: [
        { t: "Elma", e: "🍎" }, { t: "Portakal", e: "🍊" }, { t: "Muz", e: "🍌" }, { t: "Üzüm", e: "🍇" },
        { t: "Çilek", e: "🍓" }, { t: "Karpuz", e: "🍉" }, { t: "Ekmek", e: "🍞" }, { t: "Peynir", e: "🧀" },
        { t: "Yumurta", e: "🥚" }, { t: "Domates", e: "🍅" }, { t: "Havuç", e: "🥕" }, { t: "Soğan", e: "🧅" },
        { t: "Limon", e: "🍋" }, { t: "Nar", e: "🍎" }, { t: "Çay", e: "🍵" }, { t: "Süt", e: "🥛" },
        { t: "Bal", e: "🍯" }, { t: "Dondurma", e: "🍦" }, { t: "Patates", e: "🥔" }, { t: "Lahana", e: "🥬" },
        { t: "Kiraz", e: "🍒" }, { t: "Salatalık", e: "🥒" }, { t: "Mısır", e: "🌽" }, { t: "Biber", e: "🌶️" },
        { t: "Pirinç", e: "🍚" }, { t: "Pizza", e: "🍕" }, { t: "Kurabiye", e: "🍪" }, { t: "Ceviz", e: "🌰" },
        { t: "Fıstık", e: "🥜" }, { t: "Fındık", e: "🌰" }, { t: "Patlıcan", e: "🍆" }, { t: "Mandalina", e: "🍊" },
    ],
    doğa: [
        { t: "Güneş", e: "☀️" }, { t: "Ay", e: "🌙" }, { t: "Yıldız", e: "⭐" }, { t: "Bulut", e: "☁️" },
        { t: "Yağmur", e: "🌧️" }, { t: "Kar", e: "❄️" }, { t: "Gökkuşağı", e: "🌈" }, { t: "Ağaç", e: "🌳" },
        { t: "Deniz", e: "🌊" }, { t: "Dağ", e: "🏔️" }, { t: "Rüzgar", e: "💨" }, { t: "Ateş", e: "🔥" },
        { t: "Su", e: "💧" }, { t: "Gölge", e: "👤" }, { t: "Nehir", e: "🏞️" }, { t: "Göl", e: "🏞️" },
        { t: "Şimşek", e: "⚡" }, { t: "Sis", e: "🌫️" }, { t: "Çiy", e: "💧" }, { t: "Toprak", e: "🌍" },
        { t: "Sel", e: "🌊" }, { t: "Dolu", e: "🧊" }, { t: "Buz", e: "🧊" }, { t: "Tohum", e: "🌱" },
    ],
    eşyalar: [
        { t: "Saat", e: "🕐" }, { t: "Anahtar", e: "🔑" }, { t: "Kalem", e: "✏️" }, { t: "Kitap", e: "📖" },
        { t: "Ayna", e: "🪞" }, { t: "Mum", e: "🕯️" }, { t: "Davul", e: "🥁" }, { t: "Şemsiye", e: "☂️" },
        { t: "Tarak", e: "🪥" }, { t: "Ampul", e: "💡" }, { t: "Makas", e: "✂️" }, { t: "Telefon", e: "📱" },
        { t: "Televizyon", e: "📺" }, { t: "Masa", e: "🪵" }, { t: "Musluk", e: "🚰" }, { t: "Süpürge", e: "🧹" },
        { t: "Gözlük", e: "👓" }, { t: "Şapka", e: "🎩" }, { t: "Çanta", e: "🎒" }, { t: "Bardak", e: "🥤" },
        { t: "Bıçak", e: "🔪" }, { t: "Eldiven", e: "🧤" }, { t: "Bisiklet", e: "🚲" }, { t: "Bilgisayar", e: "💻" },
    ],
    vücut: [
        { t: "Göz", e: "👁️" }, { t: "Kulak", e: "👂" }, { t: "Burun", e: "👃" }, { t: "El", e: "✋" },
        { t: "Ayak", e: "🦶" }, { t: "Diş", e: "🦷" }, { t: "Kalp", e: "❤️" }, { t: "Dil", e: "👅" },
        { t: "Parmak", e: "☝️" }, { t: "Beyin", e: "🧠" }, { t: "Saç", e: "💇" }, { t: "Ağız", e: "👄" },
        { t: "Tırnak", e: "💅" }, { t: "Boyun", e: "🦒" }, { t: "Kemik", e: "🦴" },
    ],
    araçlar: [
        { t: "Araba", e: "🚗" }, { t: "Otobüs", e: "🚌" }, { t: "Bisiklet", e: "🚲" }, { t: "Tren", e: "🚂" },
        { t: "Uçak", e: "✈️" }, { t: "Gemi", e: "🚢" }, { t: "Helikopter", e: "🚁" }, { t: "Taksi", e: "🚕" },
        { t: "Kamyon", e: "🚚" }, { t: "Roket", e: "🚀" }, { t: "Kayık", e: "🛶" }, { t: "Ambulans", e: "🚑" },
    ],
};

const genericPool = [
    { t: "Kuş", e: "🐦" }, { t: "Ağaç", e: "🌳" }, { t: "Yıldız", e: "⭐" }, { t: "Kitap", e: "📖" },
    { t: "Top", e: "⚽" }, { t: "Çiçek", e: "🌸" }, { t: "Elma", e: "🍎" }, { t: "Araba", e: "🚗" },
    { t: "Güneş", e: "☀️" }, { t: "Ay", e: "🌙" }, { t: "Deniz", e: "🌊" }, { t: "Ev", e: "🏠" },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const riddles = unique.map((r, i) => {
    const [question, answer, emoji, category, ageGroup, difficulty, hint] = r;
    const id = `bilmece_${String(i + 1).padStart(3, '0')}`;

    // Generate options
    const pool = distractorPool[category] || genericPool;
    const distractors = pool.filter(d => d.t.toLowerCase() !== answer.toLowerCase());
    let picked = shuffle(distractors).slice(0, 3);
    while (picked.length < 3) {
        const g = shuffle(genericPool).find(x =>
            x.t.toLowerCase() !== answer.toLowerCase() && !picked.some(p => p.t === x.t)
        );
        if (g) picked.push(g);
        else break;
    }

    const correctOption = { text: answer, emoji, isCorrect: true };
    const wrongOptions = picked.map(d => ({ text: d.t, emoji: d.e, isCorrect: false }));
    const options = shuffle([correctOption, ...wrongOptions]);

    return {
        id, question, answer,
        answerEmoji: emoji,
        answerImage: answer.toLowerCase().replace(/\s+/g, '_'),
        hint, ageGroup, difficulty, category, options,
    };
});

console.log(`Final count: ${riddles.length}`);

// Stats
const stats = {};
for (const r of riddles) {
    const key = `${r.ageGroup}/${r.difficulty}`;
    stats[key] = (stats[key] || 0) + 1;
}
console.log('Distribution:', JSON.stringify(stats, null, 2));

const outPath = path.join(__dirname, '..', 'src', 'data', 'riddles.json');
fs.writeFileSync(outPath, JSON.stringify({ riddles }, null, 2) + '\n', 'utf8');
console.log(`Written to ${outPath}`);
