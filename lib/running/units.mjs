/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : conversions d'unités & repères
   --------------------------------------------------------------------------
   Conversions arithmétiques exactes entre allure/km, allure/mile, vitesse
   km/h, et % de VMA (si une VMA est renseignée). Aucune approximation cachée.
   ========================================================================== */

export const MILE_METERS = 1609.344;

// -- Allure (sec/km) <-> vitesse (km/h) ------------------------------------
export const kmhFromSecPerKm = (secPerKm) => (secPerKm > 0 ? 3600 / secPerKm : NaN);
export const secPerKmFromKmh = (kmh) => (kmh > 0 ? 3600 / kmh : NaN);

// -- Allure/km <-> Allure/mile ---------------------------------------------
export const secPerMileFromSecPerKm = (secPerKm) => secPerKm * (MILE_METERS / 1000);
export const secPerKmFromSecPerMile = (secPerMile) => secPerMile / (MILE_METERS / 1000);

// -- % de VMA (Vitesse Maximale Aérobie, en km/h) --------------------------
// La VMA est une vitesse ; on exprime l'allure courante en % de cette vitesse.
export function percentOfVma(secPerKm, vmaKmh) {
  const kmh = kmhFromSecPerKm(secPerKm);
  if (!(vmaKmh > 0) || !Number.isFinite(kmh)) return NaN;
  return (kmh / vmaKmh) * 100;
}

// Allure (sec/km) correspondant à un % de VMA donné.
export function secPerKmFromVmaPercent(vmaKmh, percent) {
  if (!(vmaKmh > 0) || !(percent > 0)) return NaN;
  return secPerKmFromKmh((vmaKmh * percent) / 100);
}
