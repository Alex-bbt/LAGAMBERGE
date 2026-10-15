// Petits utilitaires purs pour les pages adidas (jetons et dates).
// Les mêmes calculs tournent côté navigateur (script de ShrinkIt.astro) pour
// les valeurs en direct ; ici, ils produisent le rendu de secours au build.

const JOUR_MS = 864e5;

/** Nombre de jours entre deux dates AAAA-MM-JJ (b - a). */
export function ecartJours(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / JOUR_MS);
}

/** « 12 Oct 2026 » à partir de « 2026-10-12 ». */
export function dateLisible(ymd) {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** Remplace les jetons {cle} connus ; laisse les autres intacts. */
export function remplir(texte, valeurs) {
  return texte.replace(/\{(\w+)\}/g, (m, cle) => (cle in valeurs ? String(valeurs[cle]) : m));
}

/** Découpe un texte autour des jetons {cle} : [{texte}, {jeton}, …]. */
export function morceaux(texte) {
  return texte.split(/(\{\w+\})/).filter(Boolean).map((p) => {
    const m = p.match(/^\{(\w+)\}$/);
    return m ? { jeton: m[1] } : { texte: p };
  });
}
