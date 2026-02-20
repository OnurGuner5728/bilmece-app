// Script to add options to each riddle in riddles.json
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'riddles.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Pool of distractors per category
const distractorPool = {
    hayvanlar: [
        { text: 'Kedi', emoji: '🐱' }, { text: 'Köpek', emoji: '🐶' }, { text: 'Kuş', emoji: '🐦' },
        { text: 'Balık', emoji: '🐟' }, { text: 'Tavşan', emoji: '🐰' }, { text: 'Kaplumbağa', emoji: '🐢' },
        { text: 'Kelebek', emoji: '🦋' }, { text: 'Arı', emoji: '🐝' }, { text: 'Fil', emoji: '🐘' },
        { text: 'At', emoji: '🐴' }, { text: 'Koyun', emoji: '🐑' }, { text: 'Horoz', emoji: '🐓' },
        { text: 'Salyangoz', emoji: '🐌' }, { text: 'Yarasa', emoji: '🦇' }, { text: 'Civciv', emoji: '🐥' },
        { text: 'Ahtapot', emoji: '🐙' }, { text: 'İnek', emoji: '🐄' }, { text: 'Aslan', emoji: '🦁' },
        { text: 'Penguen', emoji: '🐧' }, { text: 'Maymun', emoji: '🐒' }, { text: 'Timsah', emoji: '🐊' },
        { text: 'Yılan', emoji: '🐍' }, { text: 'Kartal', emoji: '🦅' }, { text: 'Baykuş', emoji: '🦉' },
    ],
    yiyecek: [
        { text: 'Elma', emoji: '🍎' }, { text: 'Portakal', emoji: '🍊' }, { text: 'Muz', emoji: '🍌' },
        { text: 'Üzüm', emoji: '🍇' }, { text: 'Çilek', emoji: '🍓' }, { text: 'Karpuz', emoji: '🍉' },
        { text: 'Ekmek', emoji: '🍞' }, { text: 'Peynir', emoji: '🧀' }, { text: 'Yumurta', emoji: '🥚' },
        { text: 'Domates', emoji: '🍅' }, { text: 'Havuç', emoji: '🥕' }, { text: 'Soğan', emoji: '🧅' },
        { text: 'Patlıcan', emoji: '🍆' }, { text: 'Nar', emoji: '🍎' }, { text: 'Çay', emoji: '🍵' },
        { text: 'Süt', emoji: '🥛' }, { text: 'Bal', emoji: '🍯' }, { text: 'Dondurma', emoji: '🍦' },
        { text: 'Pırasa', emoji: '🥬' }, { text: 'Buğday', emoji: '🌾' },
    ],
    doğa: [
        { text: 'Güneş', emoji: '☀️' }, { text: 'Ay', emoji: '🌙' }, { text: 'Yıldız', emoji: '⭐' },
        { text: 'Bulut', emoji: '☁️' }, { text: 'Yağmur', emoji: '🌧️' }, { text: 'Kar', emoji: '❄️' },
        { text: 'Gökkuşağı', emoji: '🌈' }, { text: 'Ağaç', emoji: '🌳' }, { text: 'Çiçek', emoji: '🌸' },
        { text: 'Deniz', emoji: '🌊' }, { text: 'Dağ', emoji: '🏔️' }, { text: 'Rüzgar', emoji: '💨' },
        { text: 'Ateş', emoji: '🔥' }, { text: 'Su', emoji: '💧' }, { text: 'Toprak', emoji: '🌍' },
        { text: 'Gölge', emoji: '👤' }, { text: 'Tüy', emoji: '🪶' }, { text: 'Çukur', emoji: '🕳️' },
        { text: 'Yarın', emoji: '📅' }, { text: 'Zaman', emoji: '⏰' }, { text: 'Sır', emoji: '🤫' },
    ],
    eşyalar: [
        { text: 'Sandalye', emoji: '🪑' }, { text: 'Masa', emoji: '🪵' }, { text: 'Şemsiye', emoji: '☂️' },
        { text: 'Şapka', emoji: '🎩' }, { text: 'Gözlük', emoji: '👓' }, { text: 'Saat', emoji: '🕐' },
        { text: 'Anahtar', emoji: '🔑' }, { text: 'Kalem', emoji: '✏️' }, { text: 'Kitap', emoji: '📖' },
        { text: 'Çanta', emoji: '🎒' }, { text: 'Ayna', emoji: '🪞' }, { text: 'Mum', emoji: '🕯️' },
        { text: 'Davul', emoji: '🥁' }, { text: 'Çaydanlık', emoji: '🫖' }, { text: 'Bayrak', emoji: '🏳️' },
        { text: 'Eldiven', emoji: '🧤' }, { text: 'Sabun', emoji: '🧼' }, { text: 'Bıçak', emoji: '🔪' },
        { text: 'Okul', emoji: '🏫' }, { text: 'Hortum', emoji: '🚿' },
    ],
    vücut: [
        { text: 'Göz', emoji: '👁️' }, { text: 'Kulak', emoji: '👂' }, { text: 'Burun', emoji: '👃' },
        { text: 'El', emoji: '✋' }, { text: 'Ayak', emoji: '🦶' }, { text: 'Diş', emoji: '🦷' },
        { text: 'Kalp', emoji: '❤️' }, { text: 'Saç', emoji: '💇' }, { text: 'Dil', emoji: '👅' },
        { text: 'Parmak', emoji: '☝️' }, { text: 'Beyin', emoji: '🧠' }, { text: 'Kemik', emoji: '🦴' },
        { text: 'Çocuk', emoji: '👦' }, { text: 'İşaret dili', emoji: '🤟' },
    ],
    araçlar: [
        { text: 'Araba', emoji: '🚗' }, { text: 'Otobüs', emoji: '🚌' }, { text: 'Bisiklet', emoji: '🚲' },
        { text: 'Tren', emoji: '🚂' }, { text: 'Uçak', emoji: '✈️' }, { text: 'Gemi', emoji: '🚢' },
        { text: 'Helikopter', emoji: '🚁' }, { text: 'Motosiklet', emoji: '🏍️' }, { text: 'Taksi', emoji: '🚕' },
        { text: 'Kamyon', emoji: '🚚' }, { text: 'Roket', emoji: '🚀' }, { text: 'Kayık', emoji: '🛶' },
    ],
    mevsimler: [
        { text: 'İlkbahar', emoji: '🌷' }, { text: 'Yaz', emoji: '☀️' }, { text: 'Sonbahar', emoji: '🍂' },
        { text: 'Kış', emoji: '❄️' }, { text: 'Bahar', emoji: '🌸' }, { text: 'Kar', emoji: '🌨️' },
        { text: 'Güneş', emoji: '☀️' }, { text: 'Yağmur', emoji: '🌧️' }, { text: 'Rüzgar', emoji: '💨' },
    ],
};

// Generic fallback pool
const genericPool = [
    { text: 'Kuş', emoji: '🐦' }, { text: 'Ağaç', emoji: '🌳' }, { text: 'Yıldız', emoji: '⭐' },
    { text: 'Kitap', emoji: '📖' }, { text: 'Top', emoji: '⚽' }, { text: 'Çiçek', emoji: '🌸' },
    { text: 'Elma', emoji: '🍎' }, { text: 'Araba', emoji: '🚗' }, { text: 'Güneş', emoji: '☀️' },
    { text: 'Ay', emoji: '🌙' }, { text: 'Deniz', emoji: '🌊' }, { text: 'Ev', emoji: '🏠' },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

for (const riddle of data.riddles) {
    const pool = distractorPool[riddle.category] || genericPool;

    // Filter out the correct answer from distractors
    const distractors = pool.filter(d => d.text.toLowerCase() !== riddle.answer.toLowerCase());

    // Pick 3 random distractors
    const shuffledDistractors = shuffle(distractors).slice(0, 3);

    // If we don't have enough distractors from category, fill from generic
    while (shuffledDistractors.length < 3) {
        const generic = shuffle(genericPool).find(g =>
            g.text.toLowerCase() !== riddle.answer.toLowerCase() &&
            !shuffledDistractors.some(d => d.text === g.text)
        );
        if (generic) shuffledDistractors.push(generic);
        else break;
    }

    const correctOption = { text: riddle.answer, emoji: riddle.answerEmoji, isCorrect: true };
    const wrongOptions = shuffledDistractors.map(d => ({ text: d.text, emoji: d.emoji, isCorrect: false }));

    riddle.options = shuffle([correctOption, ...wrongOptions]);
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${data.riddles.length} riddles with options.`);
