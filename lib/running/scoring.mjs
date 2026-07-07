/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : cotation World Athletics
   --------------------------------------------------------------------------
   Score = a·t² + b·t + c (t en secondes), coefficients officiels par épreuve/
   sexe (voir data/wa-scoring.mjs). Donnée FACTUELLE (un barème normalisé),
   présentée sans jugement de valeur.
   ========================================================================== */

import { WA_EVENTS, waEventByKey } from './data/wa-scoring.mjs';

export { WA_EVENTS };

// Renvoie le score World Athletics (entier ≥ 0) pour une perf, ou null si
// l'épreuve est inconnue / le temps invalide.
export function waPoints(eventKey, sex, seconds) {
  const e = waEventByKey(eventKey);
  if (!e || !(seconds > 0)) return null;
  const [a, b, c] = sex === 'women' ? e.women : e.men;
  // Sommet de la parabole : au-delà (temps très lents), on est hors barème.
  const vertexT = -b / (2 * a);
  if (seconds >= vertexT) return { points: 0, event: e, offScale: true };
  const pts = a * seconds * seconds + b * seconds + c;
  return { points: Math.max(0, Math.floor(pts)), event: e, offScale: pts < 0 };
}
