const d = require('../src/data/riddles.json');
console.log('Total riddles:', d.riddles.length);

const cats = {};
const ages = {};
const diffs = {};
d.riddles.forEach(r => {
  cats[r.category] = (cats[r.category] || 0) + 1;
  ages[r.ageGroup] = (ages[r.ageGroup] || 0) + 1;
  diffs[r.difficulty] = (diffs[r.difficulty] || 0) + 1;
});
console.log('Categories:', JSON.stringify(cats, null, 2));
console.log('Age groups:', JSON.stringify(ages, null, 2));
console.log('Difficulties:', JSON.stringify(diffs, null, 2));

const ids = d.riddles.map(r => r.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupIds.length, dupIds);

const qs = d.riddles.map(r => r.question);
const dupQs = qs.filter((q, i) => qs.indexOf(q) !== i);
console.log('Duplicate questions:', dupQs.length);

const badOpts = d.riddles.filter(r => r.options.length !== 4 || r.options.filter(o => o.isCorrect).length !== 1);
console.log('Bad options count:', badOpts.length);
if (badOpts.length > 0) {
  badOpts.forEach(r => console.log('  Bad:', r.id));
}

const missingFields = d.riddles.filter(r => !r.id || !r.question || !r.answer || !r.answerEmoji || !r.hint || !r.ageGroup || !r.difficulty || !r.category || !r.options);
console.log('Missing fields:', missingFields.length);

console.log('\nAll checks passed:', dupIds.length === 0 && dupQs.length === 0 && badOpts.length === 0 && missingFields.length === 0);
