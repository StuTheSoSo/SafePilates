const conditions = require('./src/assets/data/safety-conditions.json');
const freeIds = [
  'low_back_pain','osteoporosis','pregnancy','postpartum','arthritis','knee_issues',
  'scoliosis','disc_degeneration','rotator_cuff_injury','hip_replacement','hypertension',
  'obesity','chronic_fatigue','respiratory','vertigo_dizziness','balance_issues',
  'plantar_fasciitis','weight_concerns','other'
];
const free = new Set(freeIds);
const premiumList = conditions.filter(c => !free.has(c.id));
const freeList = conditions.filter(c => free.has(c.id));
console.log('TOTAL:', conditions.length);
console.log('FREE count:', freeList.length);
console.log('PREMIUM count:', premiumList.length);
console.log('FREE IDs:', freeList.map(c => c.id).join(', '));
console.log('PREMIUM IDs:', premiumList.map(c => c.id).join(', '));
