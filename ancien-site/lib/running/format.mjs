/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : formats & registre des distances
   --------------------------------------------------------------------------
   Fonctions PURES (aucune I/O) partagées par tous les modules de calcul.
   Importables côté client (bundlées par Vite dans les <script> Astro) ET
   côté Node (tests). Convention identique à lib/strava.mjs.
   ========================================================================== */

// -- Registre des distances de référence ----------------------------------
// L'ordre = l'ordre d'affichage. `meters` fait foi pour tous les calculs.
export const DISTANCES = [
  { key: '400m', label: '400 m', meters: 400 },
  { key: '800m', label: '800 m', meters: 800 },
  { key: '1500m', label: '1500 m', meters: 1500 },
  { key: 'mile', label: 'Mile', meters: 1609.344 },
  { key: '5k', label: '5 km', meters: 5000 },
  { key: '10k', label: '10 km', meters: 10000 },
  { key: '15k', label: '15 km', meters: 15000 },
  { key: 'semi', label: 'Semi-marathon', meters: 21097.5 },
  { key: 'marathon', label: 'Marathon', meters: 42195 },
];

export const distanceByKey = (key) => DISTANCES.find((d) => d.key === key) || null;

// Seuil du garde-fou aérobie : en dessous, la filière anaérobie domine et
// les équivalences fondées sur un modèle aérobie ne sont plus pertinentes.
export const AEROBIC_MIN_METERS = 1500;

// -- Temps « hh:mm:ss » / « mm:ss » / « ss » -> secondes -------------------
// Renvoie null si vide, NaN si invalide, un nombre de secondes sinon.
export function parseTime(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const parts = s.split(':');
  if (parts.some((p) => p !== '' && !/^\d+(\.\d+)?$/.test(p))) return NaN;
  let h = 0, m = 0, sec = 0;
  if (parts.length === 3) [h, m, sec] = parts.map(Number);
  else if (parts.length === 2) [m, sec] = parts.map(Number);
  else if (parts.length === 1) sec = Number(parts[0]);
  else return NaN;
  if ([h, m, sec].some((n) => !Number.isFinite(n))) return NaN;
  // mm et ss < 60 quand il y a plusieurs champs (un seul champ = secondes brutes)
  if (parts.length >= 2 && (sec >= 60 || (parts.length === 3 && m >= 60))) return NaN;
  const total = h * 3600 + m * 60 + sec;
  return total > 0 ? total : NaN;
}

// -- secondes -> « h:mm:ss » ou « m:ss » -----------------------------------
export function formatTime(totalSec, { forceHours = false, decimals = 0 } = {}) {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '—';
  // Arrondi à la précision affichée AVANT découpage : évite qu'un 12600.0000001
  // ou 12599.9999999 (jitter en virgule flottante) ne s'affiche « 3:29:59 ».
  const rounded = decimals > 0 ? totalSec : Math.round(totalSec);
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  let s = whole % 60;
  let tail = '';
  if (decimals > 0) tail = '.' + String(Math.round(frac * 10 ** decimals)).padStart(decimals, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 || forceHours ? `${h}:${mm}:${ss}${tail}` : `${m}:${ss}${tail}`;
}

// -- Allure « m:ss » (min/km) -> secondes/km -------------------------------
export function parsePace(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const parts = s.split(':');
  if (parts.length === 1) {
    const m = Number(parts[0].replace(',', '.'));
    return Number.isFinite(m) && m >= 0 ? Math.round(m * 60) : NaN;
  }
  if (parts.length === 2) {
    const m = Number(parts[0]);
    const sec = Number(parts[1]);
    if (!Number.isFinite(m) || !Number.isFinite(sec) || sec >= 60 || sec < 0) return NaN;
    const total = m * 60 + sec;
    return total > 0 ? total : NaN;
  }
  return NaN;
}

// -- secondes/km -> « m:ss » -----------------------------------------------
export function formatPace(secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '—';
  const s = Math.round(secPerKm);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// -- Distance libre en km (accepte la virgule) -----------------------------
export function parseDistanceKm(v) {
  const s = String(v ?? '').trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

// Affiche des km avec les décimales utiles, virgule à la française.
export function formatKm(km) {
  const rounded = Math.round(km * 1000) / 1000;
  return String(rounded).replace('.', ',');
}
