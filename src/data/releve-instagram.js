// Relevé Instagram automatique, lu au moment de la construction du site.
// Source : le dernier bilan enregistré par la tâche quotidienne
// (/api/instagram-sync → table instagram_snapshot de lagamberge-db).
// Sont repris : les abonnés, les vues 2026 du compte et les pays des abonnés
// (en % du nombre total d'abonnés, 3 premiers pays). Le reste des statistiques
// Instagram reste relevé à la main.
// En cas d'absence ou d'anomalie : null → le site garde les valeurs manuelles.
// Exécuté uniquement pendant la construction (jamais dans le navigateur).

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

const nomsPays = new Intl.DisplayNames(['fr'], { type: 'region' });

/** Trois premiers pays (codes ISO → noms français) ; null si incohérent. */
export function paysAuto(lignes) {
  if (!Array.isArray(lignes) || !lignes.length) return null;
  const top = lignes.slice(0, 3);
  const ok = top.every((l) => /^[A-Z]{2}$/.test(l.cle) && typeof l.valeur === 'number' && l.valeur > 0 && l.valeur <= 100) &&
    top.reduce((s, l) => s + l.valeur, 0) <= 100 && top[0].cle === 'FR';
  return ok ? top.map((l) => ({ libelle: nomsPays.of(l.cle), valeur: l.valeur })) : null;
}

export async function releveInstagramAuto(env = process.env, fetchFn = globalThis.fetch) {
  const url = env.SUPABASE_URL;
  const cle = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle || !fetchFn) return null;
  try {
    const r = await fetchFn(`${url}/rest/v1/instagram_snapshot?id=eq.1&select=data`, {
      headers: { apikey: cle, Authorization: `Bearer ${cle}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const d = (await r.json())?.[0]?.data;
    const ok =
      d && d.compte === 'lagambergee' &&
      Number.isInteger(d.abonnes) && d.abonnes > 1000 && d.abonnes < 10_000_000 &&
      Number.isInteger(d.vuesCompte2026) && d.vuesCompte2026 > 0 &&
      typeof d.releveIso === 'string' && !Number.isNaN(Date.parse(d.releveIso));
    if (!ok) return null;
    return { abonnes: d.abonnes, vues: d.vuesCompte2026, pays: paysAuto(d.audience?.paysSurAbonnes), releve: formatDate(d.releveIso), releveCourt: formatDate(d.releveIso).replace(/ \d{4}$/, ''), releveIso: d.releveIso };
  } catch {
    return null;
  }
}
