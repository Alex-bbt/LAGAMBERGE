/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : age-grading WMA
   --------------------------------------------------------------------------
   % de la performance par rapport au STANDARD théorique (niveau record) de la
   catégorie d'âge et de sexe, d'après les tables WMA/USATF (Alan Jones, éd.
   2020 — voir data/wma-agegrading.mjs). Purement FACTUEL : aucun « bon/mauvais ».

   Méthode (identique à la référence) :
     standard_âge = standard_open / facteur_âge
     age grade %  = standard_âge / temps × 100
   ========================================================================== */

import {
  WMA_EVENTS,
  WMA_AGE_MIN,
  WMA_AGE_MAX,
  WMA_EDITION,
  WMA_SOURCE,
} from './data/wma-agegrading.mjs';

export { WMA_EVENTS, WMA_AGE_MIN, WMA_AGE_MAX, WMA_EDITION, WMA_SOURCE };

// Liste des épreuves disponibles pour l'age-grading (ordre d'affichage).
export const WMA_EVENT_LIST = Object.entries(WMA_EVENTS).map(([key, e]) => ({
  key,
  label: e.label,
  meters: e.meters,
}));

function sideFor(event, sex) {
  return sex === 'women' || sex === 'female' ? event.female : event.male;
}

export function ageGrade(eventKey, sex, age, seconds) {
  const ev = WMA_EVENTS[eventKey];
  if (!ev || !(seconds > 0) || !(age > 0)) return null;
  const side = sideFor(ev, sex);
  const clamped = Math.min(WMA_AGE_MAX, Math.max(WMA_AGE_MIN, Math.round(age)));
  const factor = side.factors[clamped - WMA_AGE_MIN];
  if (!(factor > 0)) return null;
  const openStandard = side.open;
  const ageStandard = openStandard / factor;
  return {
    percent: (ageStandard / seconds) * 100,
    ageStandard,
    ageFactor: factor,
    openStandard,
    ageClamped: clamped !== Math.round(age),
  };
}

// Repère « % du niveau record mondial » (standard open WMA, sans effet d'âge).
// Sert au sous-module « repères » du convertisseur.
export function percentOfWorldClass(eventKey, sex, seconds) {
  const ev = WMA_EVENTS[eventKey];
  if (!ev || !(seconds > 0)) return null;
  const side = sideFor(ev, sex);
  return { percent: (side.open / seconds) * 100, openStandard: side.open };
}
