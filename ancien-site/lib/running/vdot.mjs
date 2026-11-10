/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : modèle VDOT (Daniels & Gilbert)
   --------------------------------------------------------------------------
   Reconstruction du modèle à partir des ÉQUATIONS PUBLIÉES (Daniels & Gilbert),
   PAS des tables imprimées du livre (protégées). On recalcule tout :
     - coût en O2 d'une vitesse de course ;
     - courbe %VO2max en fonction de la durée ;
     - VDOT d'une performance ;
     - temps de « niveau équivalent » sur une autre distance (racine numérique).

   Sources des équations (domaine scientifique, largement republiées) :
     Daniels J., Gilbert J. « Oxygen Power: Performance Tables for Distance
     Runners » (1979). Équations reprises dans « Daniels' Running Formula ».
   ========================================================================== */

// Coût en oxygène (ml/kg/min) d'une vitesse v exprimée en MÈTRES PAR MINUTE.
export function vo2Cost(vMetersPerMin) {
  const v = vMetersPerMin;
  return -4.60 + 0.182258 * v + 0.000104 * v * v;
}

// Fraction de VO2max soutenable pour une durée d'effort t (en MINUTES).
export function percentVO2max(tMin) {
  return (
    0.8 +
    0.1894393 * Math.exp(-0.012778 * tMin) +
    0.2989558 * Math.exp(-0.1932605 * tMin)
  );
}

// VDOT d'une performance (distance en mètres, temps en secondes).
export function vdotFromRace(meters, seconds) {
  if (!(meters > 0) || !(seconds > 0)) return NaN;
  const tMin = seconds / 60;
  const vMetersPerMin = meters / tMin;
  return vo2Cost(vMetersPerMin) / percentVO2max(tMin);
}

// Temps (en secondes) d'une performance de VDOT donné sur une distance donnée.
// Résolution par bissection : on cherche t tel que le coût O2 de la vitesse
// (meters/t) égale vdot·%VO2max(t). f(t) décroît de + (t petit) à − (t grand).
export function timeForDistanceAtVdot(meters, vdot) {
  if (!(meters > 0) || !(vdot > 0)) return NaN;
  const f = (tMin) => vo2Cost(meters / tMin) - vdot * percentVO2max(tMin);
  let lo = 0.1; // minutes (borne très rapide)
  let hi = 600; // minutes (borne très lente)
  if (f(lo) < 0 || f(hi) > 0) return NaN; // hors domaine du modèle
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 60; // -> secondes
}

// Tableau des performances de niveau équivalent.
// targets : liste d'objets { key, label, meters }. Renvoie chaque cible avec
// son temps équivalent (secondes) — la référence elle-même incluse pour repère.
export function equivalentPerformances(refMeters, refSeconds, targets) {
  const vdot = vdotFromRace(refMeters, refSeconds);
  if (!Number.isFinite(vdot)) return { vdot: NaN, rows: [] };
  const rows = targets.map((t) => ({
    ...t,
    seconds: timeForDistanceAtVdot(t.meters, vdot),
    isRef: Math.abs(t.meters - refMeters) < 1,
  }));
  return { vdot, rows };
}

/* --------------------------------------------------------------------------
   Allures d'entraînement Daniels (E / M / T / I / R)
   --------------------------------------------------------------------------
   Reconstruites à partir du VDOT. Choix de modélisation DOCUMENTÉS (les tables
   d'entraînement imprimées ne sont pas recopiées) :
     - I (Interval)   : vitesse à vVO2max (coût O2 == VDOT), soit ~100 % VO2max.
     - T (Threshold)  : coût O2 == 0.88·VDOT (~seuil, allure ~1 h de course).
     - M (Marathon)   : allure d'équivalence sur marathon (timeForDistance...).
     - E (Easy)       : bande de coût O2 0.66→0.74·VDOT.
     - R (Repetition) : supramaximale — vitesse = vI × 1.07 (facteur empirique).
   Ces ancres sont validées en ORDRE DE GRANDEUR contre les valeurs publiées
   (voir lib/running/test.mjs). Présentées comme des ZONES THÉORIQUES, jamais
   comme un plan d'entraînement.
   -------------------------------------------------------------------------- */

// Vitesse (m/min) dont le coût O2 vaut `frac`·VDOT.
function velocityForVo2(target) {
  // Résout 0.000104 v² + 0.182258 v − (4.60 + target) = 0 (racine positive).
  const a = 0.000104;
  const b = 0.182258;
  const c = -(4.60 + target);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return NaN;
  return (-b + Math.sqrt(disc)) / (2 * a);
}

// m/min -> secondes par km.
const secPerKmFromVel = (vMetersPerMin) => 60000 / vMetersPerMin;

export function trainingPaces(vdot) {
  if (!(vdot > 0)) return null;
  const vI = velocityForVo2(vdot); // vVO2max
  const vT = velocityForVo2(0.88 * vdot);
  const vEfast = velocityForVo2(0.74 * vdot);
  const vEslow = velocityForVo2(0.66 * vdot);
  const vR = vI * 1.07;
  const marathonSec = timeForDistanceAtVdot(42195, vdot);
  const vM = 42195 / (marathonSec / 60); // m/min

  return {
    vdot,
    easy: { slow: secPerKmFromVel(vEslow), fast: secPerKmFromVel(vEfast) }, // sec/km
    marathon: secPerKmFromVel(vM),
    threshold: secPerKmFromVel(vT),
    interval: secPerKmFromVel(vI),
    repetition: secPerKmFromVel(vR),
  };
}

// Temps (secondes) pour couvrir `meters` à une allure donnée (sec/km).
export function repTime(secPerKm, meters) {
  return (secPerKm * meters) / 1000;
}
