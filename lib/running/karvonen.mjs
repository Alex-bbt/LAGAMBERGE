/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : zones cardiaques (Karvonen)
   --------------------------------------------------------------------------
   Méthode de la FRÉQUENCE CARDIAQUE DE RÉSERVE (Karvonen et al., 1957) :
     FC cible = FC repos + intensité · (FC max − FC repos)
   Purement factuel. La FC max « théorique » (220 − âge) est un repère de
   population très imprécis à l'échelle individuelle : à afficher avec réserve.
   ========================================================================== */

// Estimation de population — à afficher AVEC un disclaimer d'imprécision.
export function theoreticalHrMax(age) {
  if (!(age > 0)) return NaN;
  return 220 - age;
}

// Renvoie la FC cible (bpm) pour une intensité (0..1) de FC de réserve.
export function karvonenTarget(hrRest, hrMax, intensity) {
  if (!(hrMax > hrRest) || !(intensity >= 0)) return NaN;
  return hrRest + intensity * (hrMax - hrRest);
}

// Bandes indicatives associables aux zones Daniels (%FC réserve).
// Ce sont des PLAGES DE RÉFÉRENCE, pas des prescriptions.
export const KARVONEN_ZONES = [
  { key: 'easy', label: 'Easy (E)', lo: 0.65, hi: 0.78 },
  { key: 'marathon', label: 'Marathon (M)', lo: 0.78, hi: 0.86 },
  { key: 'threshold', label: 'Threshold (T)', lo: 0.86, hi: 0.90 },
  { key: 'interval', label: 'Interval (I)', lo: 0.95, hi: 1.0 },
];

export function karvonenZones(hrRest, hrMax) {
  if (!(hrMax > hrRest)) return [];
  return KARVONEN_ZONES.map((z) => ({
    ...z,
    bpmLo: Math.round(karvonenTarget(hrRest, hrMax, z.lo)),
    bpmHi: Math.round(karvonenTarget(hrRest, hrMax, z.hi)),
  }));
}
