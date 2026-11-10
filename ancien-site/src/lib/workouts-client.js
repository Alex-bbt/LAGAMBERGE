/* ==========================================================================
   LA GAMBERGE — HELPERS CLIENT « SÉANCES » (navigateur, partagés)
   --------------------------------------------------------------------------
   Utilisé à la fois par la bibliothèque (WorkoutLibrary.astro) et par la page
   détail (pages/coureur/seance.astro). Charge les séances depuis Supabase
   (/api/workouts) avec repli automatique sur les séances de secours, et fournit
   les formateurs communs (allure, temps, distance).
   ========================================================================== */
import { workoutsFallback, workoutCategoriesFallback } from '../data/workouts.js';

export const FALLBACK = { categories: workoutCategoriesFallback, workouts: workoutsFallback };

// -- Formatage --------------------------------------------------------------
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = (n) => String(n).padStart(2, '0');

export function fmtPace(sec) {
  sec = Math.round(sec);
  return `${Math.floor(sec / 60)}:${pad(sec % 60)}/km`;
}
export function fmtTime(sec) {
  sec = Math.round(sec);
  if (sec >= 3600) return `${Math.floor(sec / 3600)} h ${pad(Math.floor((sec % 3600) / 60))}`;
  if (sec % 60 === 0 && sec >= 60) return `${sec / 60} min`;
  return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
}
export function fmtDist(m) {
  return m >= 1000 ? `${(m / 1000).toString().replace('.', ',')} km` : `${m} m`;
}
export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'seance';
}

// La `structure` d'une séance peut être écrite de deux façons dans Supabase :
//   - une LISTE d'étapes directement : [ {...}, {...} ]   (format recommandé)
//   - un OBJET qui enveloppe la liste : { "etapes": [ {...} ] }
// On tolère les deux → toujours renvoyer une liste d'étapes exploitable.
export function toSteps(structure) {
  if (Array.isArray(structure)) return structure;
  if (structure && Array.isArray(structure.etapes)) return structure.etapes;
  return [];
}

// -- Normalisation (live ou secours → même forme) ---------------------------
export function normalize(data) {
  const categories = data.categories || [];
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  const workouts = (data.workouts || []).map((w) => ({
    ...w,
    structure: toSteps(w.structure),
    categorie: w.categorie || byId[w.categorie_id] || null,
    guidance: w.guidance || [],
  }));
  return { categories, workouts };
}

// -- Chargement : Supabase en direct, sinon secours -------------------------
export async function loadWorkouts() {
  try {
    const r = await fetch('/api/workouts', { headers: { Accept: 'application/json' } });
    if (r.ok) {
      const d = await r.json();
      if (d && d.configured && Array.isArray(d.workouts) && d.workouts.length) return normalize(d);
    }
  } catch { /* réseau indispo → secours */ }
  return normalize(FALLBACK);
}
