/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : formule de Riegel
   --------------------------------------------------------------------------
   Loi de puissance empirique (Peter Riegel, 1977/1981) :
     T2 = T1 · (D2 / D1) ^ 1.06
   Modèle EMPIRIQUE (ajustement statistique), à distinguer du VDOT qui, lui,
   raisonne en %VO2max. On expose l'exposant en paramètre (défaut 1.06).
   ========================================================================== */

export const RIEGEL_EXPONENT = 1.06;

// T1 en secondes sur D1 mètres -> temps équivalent (secondes) sur D2 mètres.
export function riegelTime(t1Seconds, d1Meters, d2Meters, exponent = RIEGEL_EXPONENT) {
  if (!(t1Seconds > 0) || !(d1Meters > 0) || !(d2Meters > 0)) return NaN;
  return t1Seconds * Math.pow(d2Meters / d1Meters, exponent);
}

export function riegelEquivalents(refSeconds, refMeters, targets, exponent = RIEGEL_EXPONENT) {
  return targets.map((t) => ({
    ...t,
    seconds: riegelTime(refSeconds, refMeters, t.meters, exponent),
    isRef: Math.abs(t.meters - refMeters) < 1,
  }));
}
