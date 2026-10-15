/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : plans de splits
   --------------------------------------------------------------------------
   Génère les temps de passage (par km ou par mile) pour un temps cible et une
   distance donnés, selon trois STRATÉGIES présentées côte à côte, sans jugement :
     - even     : allure constante ;
     - negative : 2e moitié plus rapide de `deltaPercent` % ;
     - positive : 2e moitié plus lente de `deltaPercent` %.
   Aucune stratégie n'est désignée comme « la meilleure ». Ce sont des repères
   arithmétiques décrits dans la littérature (négative/positive split).
   ========================================================================== */

import { MILE_METERS } from './units.mjs';

// Construit les splits pour une allure en deux moitiés.
// deltaPercent > 0  -> negative split (2e moitié plus rapide)
// deltaPercent = 0  -> allure constante
// deltaPercent < 0  -> positive split (2e moitié plus lente)
export function buildSplits(meters, totalSec, deltaPercent, unitMeters) {
  if (!(meters > 0) || !(totalSec > 0) || !(unitMeters > 0)) return [];
  const x = deltaPercent / 100;
  const H = meters / 2;
  // total = p1·H·(2 − x)  ->  p1 (sec/m) de la 1re moitié
  const p1 = totalSec / (H * (2 - x));
  const p2 = p1 * (1 - x);
  const cumTime = (dist) => (dist <= H ? p1 * dist : p1 * H + p2 * (dist - H));

  const splits = [];
  let from = 0;
  let idx = 1;
  while (from < meters - 1e-6) {
    const to = Math.min(from + unitMeters, meters);
    const splitSec = cumTime(to) - cumTime(from);
    splits.push({
      index: idx,
      fromM: from,
      toM: to,
      lengthM: to - from,
      splitSec,
      cumSec: cumTime(to),
      // allure ramenée au km pour lisibilité (même si le segment est partiel)
      paceSecPerKm: (splitSec / (to - from)) * 1000,
    });
    from = to;
    idx += 1;
  }
  return splits;
}

// Les trois stratégies d'un coup. unit : 'km' | 'mile'.
export function threeStrategies(meters, totalSec, { deltaPercent = 2, unit = 'km' } = {}) {
  const unitMeters = unit === 'mile' ? MILE_METERS : 1000;
  return {
    unit,
    unitMeters,
    deltaPercent,
    even: buildSplits(meters, totalSec, 0, unitMeters),
    negative: buildSplits(meters, totalSec, deltaPercent, unitMeters),
    positive: buildSplits(meters, totalSec, -deltaPercent, unitMeters),
  };
}
