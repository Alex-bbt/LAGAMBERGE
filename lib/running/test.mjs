/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : tests de cohérence (Node, hors build)
   --------------------------------------------------------------------------
   Lancer :  node lib/running/test.mjs
   Vérifie les ordres de grandeur des modèles avant livraison. N'est jamais
   importé par le site (pas de dépendance client).
   ========================================================================== */

import { parseTime, formatTime, formatPace, DISTANCES, distanceByKey } from './format.mjs';
import { vdotFromRace, timeForDistanceAtVdot, equivalentPerformances, trainingPaces } from './vdot.mjs';
import { riegelTime } from './riegel.mjs';
import { karvonenZones } from './karvonen.mjs';
import { kmhFromSecPerKm, secPerMileFromSecPerKm } from './units.mjs';
import { threeStrategies } from './splits.mjs';
import { waPoints } from './scoring.mjs';
import { ageGrade, percentOfWorldClass, WMA_EVENTS } from './agegrading.mjs';

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}  ${extra}`); }
}
function near(a, b, tol) { return Math.abs(a - b) <= tol; }

console.log('\n== VDOT & Riegel : marathon 2:38:41 -> 5 km (attendu ~16:32-16:47) ==');
const maraSec = parseTime('2:38:41');
const vdot = vdotFromRace(42195, maraSec);
console.log(`  VDOT ≈ ${vdot.toFixed(2)}`);
const vdot5k = timeForDistanceAtVdot(5000, vdot);
const rieg5k = riegelTime(maraSec, 42195, 5000);
console.log(`  VDOT 5k = ${formatTime(vdot5k)}  |  Riegel 5k = ${formatTime(rieg5k)}`);
check('VDOT 5k dans 16:20-16:55', vdot5k >= 980 && vdot5k <= 1015, formatTime(vdot5k));
check('Riegel 5k dans 16:20-16:55', rieg5k >= 980 && rieg5k <= 1015, formatTime(rieg5k));
check('VDOT marathon ~62', near(vdot, 62, 1.5), vdot.toFixed(2));

console.log('\n== Aller-retour VDOT (auto-cohérence) ==');
for (const d of [1500, 5000, 10000, 21097.5, 42195]) {
  const t = timeForDistanceAtVdot(d, 55);
  const back = vdotFromRace(d, t);
  check(`round-trip VDOT 55 @ ${d}m -> ${back.toFixed(3)}`, near(back, 55, 0.05), back.toFixed(4));
}

console.log('\n== Allures Daniels @ VDOT 50 (ordres de grandeur publiés) ==');
const tp = trainingPaces(50);
console.log(`  E ${formatPace(tp.easy.slow)}–${formatPace(tp.easy.fast)} · M ${formatPace(tp.marathon)} · T ${formatPace(tp.threshold)} · I ${formatPace(tp.interval)} · R ${formatPace(tp.repetition)} /km`);
check('T ~4:15/km (±10s)', near(tp.threshold, 255, 10), formatPace(tp.threshold));
check('I ~3:50/km (±12s)', near(tp.interval, 230, 12), formatPace(tp.interval));
check('M ~4:45/km (±15s)', near(tp.marathon, 285, 15), formatPace(tp.marathon));
check('R plus rapide que I', tp.repetition < tp.interval);
check('E (slow) plus lent que M', tp.easy.slow > tp.marathon);

console.log('\n== Conversions d\'unités ==');
check('4:00/km = 15 km/h', near(kmhFromSecPerKm(240), 15, 1e-9), kmhFromSecPerKm(240).toString());
check('4:00/km = 6:26/mile', near(secPerMileFromSecPerKm(240), 386.24, 0.5), formatPace(secPerMileFromSecPerKm(240)));

console.log('\n== Karvonen (repos 50, max 190) ==');
const kz = karvonenZones(50, 190);
const easy = kz.find((z) => z.key === 'easy');
check('Easy 65% = 141 bpm', easy.bpmLo === Math.round(50 + 0.65 * 140), String(easy.bpmLo));

console.log('\n== Splits marathon 3:00:00 ==');
const s = threeStrategies(42195, parseTime('3:00:00'), { deltaPercent: 2, unit: 'km' });
const sum = (arr) => arr.reduce((a, b) => a + b.splitSec, 0);
check('even: somme = total', near(sum(s.even), 10800, 0.01), sum(s.even).toFixed(3));
check('negative: somme = total', near(sum(s.negative), 10800, 0.01), sum(s.negative).toFixed(3));
check('negative: 2e moitié plus rapide', s.negative[s.negative.length - 1].paceSecPerKm < s.negative[0].paceSecPerKm);
check('positive: 2e moitié plus lente', s.positive[s.positive.length - 1].paceSecPerKm > s.positive[0].paceSecPerKm);
check('even: ~42 splits (41 pleins + reste)', s.even.length === 43, String(s.even.length));

console.log('\n== World Athletics : records du monde ≈ 1300 pts ==');
const p1 = waPoints('marathon', 'men', parseTime('2:00:35')); // Kiptum WR
const p2 = waPoints('5000m', 'men', parseTime('12:35.36'));    // Cheptegei WR
const p3 = waPoints('marathon', 'women', parseTime('2:09:56'));
console.log(`  Marathon H 2:00:35 = ${p1.points} · 5000m H 12:35.36 = ${p2.points} · Marathon F 2:09:56 = ${p3.points}`);
check('Marathon H WR ~1300 (1280-1320)', p1.points >= 1280 && p1.points <= 1320, String(p1.points));
check('5000m H WR ~1300 (1280-1320)', p2.points >= 1280 && p2.points <= 1320, String(p2.points));
check('Marathon F WR ~1300 (1280-1330)', p3.points >= 1280 && p3.points <= 1330, String(p3.points));
const p4 = waPoints('10k', 'men', parseTime('40:00'));
check('10 km H 40:00 : score plausible (150-450)', p4.points >= 150 && p4.points <= 450, String(p4.points));
check('temps très lent = hors barème (0)', waPoints('marathon', 'men', parseTime('6:00:00')).points === 0);

console.log('\n== WMA age-grading : standard open ≈ 100 % à l\'âge de pointe ==');
// Âge où le facteur 10 km H est maximal (=1.0)
const f10kH = WMA_EVENTS['10k'].male.factors;
const bestIdx = f10kH.indexOf(Math.max(...f10kH));
const bestAge = bestIdx + 5;
const ag = ageGrade('10k', 'men', bestAge, WMA_EVENTS['10k'].male.open);
console.log(`  10 km H, âge ${bestAge}, temps = standard open (${WMA_EVENTS['10k'].male.open}s) -> ${ag.percent.toFixed(2)} %`);
check('age grade ≈ 100 % au standard open', near(ag.percent, 100, 0.2), ag.percent.toFixed(3));
const young = ageGrade('marathon', 'women', 30, 10800);
const old = ageGrade('marathon', 'women', 70, 10800);
check('même temps : plus âgé -> % plus élevé', old.percent > young.percent, `${young.percent.toFixed(1)} vs ${old.percent.toFixed(1)}`);
check('percentOfWorldClass(standard) = 100 %', near(percentOfWorldClass('half', 'men', WMA_EVENTS['half'].male.open).percent, 100, 1e-6));

console.log(`\n== TOTAL : ${pass} ok, ${fail} ko ==\n`);
process.exit(fail ? 1 : 0);
