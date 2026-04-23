const exercises = require('./src/assets/data/exercises.json');
const premiumTerms = ['reformer','cadillac','chair','barrel','tower','strap','spring','props','prop','carriage','apparatus'];
function isPremium(e) {
  return premiumTerms.some(function(t) {
    return (e.category||'').toLowerCase().indexOf(t) !== -1 ||
           (e.equipment||'').toLowerCase().indexOf(t) !== -1 ||
           (e.apparatusSettings||'').toLowerCase().indexOf(t) !== -1;
  });
}
const premiumEx = exercises.filter(isPremium);
const freeEx = exercises.filter(function(e) { return !isPremium(e); });
const cats = function(arr) { return Array.from(new Set(arr.map(function(e){ return e.category; }))).sort().join(', '); };
console.log('TOTAL exercises:', exercises.length);
console.log('FREE (' + freeEx.length + ') categories:', cats(freeEx));
console.log('PREMIUM (' + premiumEx.length + ') categories:', cats(premiumEx));
console.log('PREMIUM exercise names:', premiumEx.map(function(e){ return e.name; }).join(', '));
