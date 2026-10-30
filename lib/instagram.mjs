/* ==========================================================================
   LA GAMBERGE — STATISTIQUES INSTAGRAM (côté serveur)
   --------------------------------------------------------------------------
   Lit le compte professionnel d'Alex via l'API Instagram et calcule les
   indicateurs du media kit. Deux types de jeton sont acceptés, détectés
   automatiquement :
     - jeton « connexion Instagram » (commence par « IG ») → graph.instagram.com,
       compte = /me, jeton de 60 jours à renouveler ;
     - jeton « connexion unifiée » (utilisateur système d'un portefeuille
       business, commence par « EAA ») → graph.facebook.com, compte = l'ID du
       compte Instagram pro (INSTAGRAM_USER_ID), jeton sans expiration.
   C'est la connexion unifiée que Meta impose aux nouvelles apps (oct. 2026).
   Jamais exécuté côté navigateur : le jeton reste sur le serveur.

   Ce qui est calculé, avec la même définition que les relevés manuels :
     - abonnés ;
     - publications de 2026 (feed + Reels ; les stories ne sont pas listées
       par l'API) et, pour elles : vues médianes, nombre à plus de 10 000 et
       de 100 000 vues, total des interactions ;
     - vues du compte sur l'année (indicateur « views » du compte, toutes
       surfaces confondues), additionnées par fenêtres de 30 jours ;
     - audience des abonnés : âge, genre, pays, villes (en %).
   Ce qui n'est PAS calculé : l'engagement « interactions / couverture » (la
   couverture d'une année ne s'additionne pas jour par jour) et les vues
   médianes des stories. Ils restent relevés à la main.

   Toutes les fonctions réseau reçoivent `fetch` en paramètre (testables).
   ========================================================================== */

export const API = 'https://graph.instagram.com';
export const API_FACEBOOK = 'https://graph.facebook.com';
export const VERSION = 'v25.0';

/** Cible des appels selon le type de jeton : hôte de l'API et nœud du compte. */
export function cibleDuJeton(jeton, idCompte) {
  if (String(jeton).startsWith('IG')) return { hote: API, compte: '/me', renouvelable: true };
  if (!idCompte) throw new Error('Instagram : INSTAGRAM_USER_ID manquant pour un jeton de connexion unifiée');
  return { hote: API_FACEBOOK, compte: `/${idCompte}`, renouvelable: false };
}

const JOUR = 24 * 3600 * 1000;

/** Appel GET à l'API. Lève une erreur lisible (sans le jeton) en cas d'échec. */
export async function appel(fetchFn, chemin, params, jeton, { versionnee = true, hote = API } = {}) {
  const url = new URL(`${hote}${versionnee ? `/${VERSION}` : ''}${chemin}`);
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  url.searchParams.set('access_token', jeton);
  const r = await fetchFn(url.toString());
  let corps = null;
  try { corps = await r.json(); } catch { /* corps vide */ }
  if (!r.ok || corps?.error) {
    const e = new Error(`Instagram ${chemin} : ${corps?.error?.message || `HTTP ${r.status}`}`);
    e.code = corps?.error?.code;
    e.statut = r.status;
    throw e;
  }
  return corps;
}

/** Profil : identifiant, pseudo, abonnés, nombre de publications. */
export function lireProfil(fetchFn, jeton, cible = { hote: API, compte: '/me' }) {
  const champs = cible.hote === API ? 'user_id,username,followers_count,media_count' : 'id,username,followers_count,media_count';
  return appel(fetchFn, cible.compte, { fields: champs }, jeton, { hote: cible.hote });
}

/**
 * Publications depuis `depuis` (ISO), de la plus récente à la plus ancienne.
 * L'API renvoie les publications par ordre antéchronologique : on s'arrête
 * dès qu'on passe avant la date de début.
 */
export async function lirePublications(fetchFn, jeton, depuis, cible = { hote: API, compte: '/me' }) {
  const limite = new Date(depuis).getTime();
  const resultat = [];
  let page = await appel(fetchFn, `${cible.compte}/media`, {
    fields: 'id,media_type,media_product_type,timestamp,permalink,like_count,comments_count',
    limit: 100,
  }, jeton, { hote: cible.hote });
  for (let garde = 0; garde < 50; garde++) {
    const items = page?.data || [];
    for (const m of items) {
      if (new Date(m.timestamp).getTime() < limite) return resultat;
      resultat.push(m);
    }
    const suivante = page?.paging?.next;
    if (!suivante || items.length === 0) break;
    const r = await fetchFn(suivante);
    page = await r.json();
    if (!r.ok || page?.error) throw new Error(`Instagram /me/media (page suivante) : ${page?.error?.message || `HTTP ${r.status}`}`);
  }
  return resultat;
}

// Indicateurs demandés par publication ; si l'API en refuse un pour ce type
// de publication, on redemande avec la liste minimale.
const METRIQUES_PUBLICATION = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions'];
const METRIQUES_MINIMALES = ['views', 'reach', 'total_interactions'];

const valeurs = (reponse) => Object.fromEntries((reponse?.data || []).map((d) => [d.name, d.values?.[0]?.value ?? d.total_value?.value ?? null]));

/** Statistiques d'une publication (null si l'API n'en fournit aucune). */
export async function lireStatsPublication(fetchFn, jeton, id, cible = { hote: API }) {
  try {
    return valeurs(await appel(fetchFn, `/${id}/insights`, { metric: METRIQUES_PUBLICATION.join(',') }, jeton, { hote: cible.hote }));
  } catch {
    try {
      return valeurs(await appel(fetchFn, `/${id}/insights`, { metric: METRIQUES_MINIMALES.join(',') }, jeton, { hote: cible.hote }));
    } catch {
      return null;
    }
  }
}

/** Exécute `fn` sur chaque élément, `n` à la fois (respect des limites d'appel). */
export async function parLots(elements, n, fn) {
  const sortie = new Array(elements.length);
  let i = 0;
  const travailleurs = Array.from({ length: Math.min(n, elements.length) }, async () => {
    while (i < elements.length) {
      const k = i++;
      sortie[k] = await fn(elements[k], k);
    }
  });
  await Promise.all(travailleurs);
  return sortie;
}

/**
 * Vues du compte entre deux dates, additionnées par fenêtres de 30 jours
 * (l'API limite chaque requête à 30 jours). null si l'indicateur est refusé.
 */
export async function lireVuesCompte(fetchFn, jeton, debutIso, finMs, cible = { hote: API, compte: '/me' }) {
  let debut = new Date(debutIso).getTime();
  let total = 0;
  try {
    while (debut < finMs) {
      const fin = Math.min(debut + 30 * JOUR, finMs);
      const r = await appel(fetchFn, `${cible.compte}/insights`, {
        metric: 'views', period: 'day', metric_type: 'total_value',
        since: Math.floor(debut / 1000), until: Math.floor(fin / 1000),
      }, jeton, { hote: cible.hote });
      const v = r?.data?.[0]?.total_value?.value;
      if (typeof v !== 'number') return null;
      total += v;
      debut = fin;
    }
    return total;
  } catch {
    return null;
  }
}

/** Audience des abonnés, une ventilation à la fois. null si indisponible. */
export async function lireAudience(fetchFn, jeton, cible = { hote: API, compte: '/me' }) {
  const audience = {};
  for (const ventilation of ['age', 'gender', 'country', 'city']) {
    try {
      const r = await appel(fetchFn, `${cible.compte}/insights`, {
        metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', breakdown: ventilation,
      }, jeton, { hote: cible.hote });
      const resultats = r?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
      audience[ventilation] = resultats.map((x) => ({ cle: x.dimension_values?.[0], valeur: x.value }));
    } catch {
      audience[ventilation] = null;
    }
  }
  return audience;
}

// -- Calculs (purs) -----------------------------------------------------------

export function mediane(nombres) {
  const t = nombres.filter((n) => typeof n === 'number').sort((a, b) => a - b);
  if (!t.length) return null;
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : Math.round((t[m - 1] + t[m]) / 2);
}

const arrondi1 = (n) => Math.round(n * 10) / 10;

/** Convertit des effectifs en pourcentages (une décimale), du plus grand au plus petit. */
export function enPourcentages(lignes) {
  if (!lignes || !lignes.length) return null;
  const total = lignes.reduce((s, l) => s + (l.valeur || 0), 0);
  if (!total) return null;
  return lignes
    .map((l) => ({ cle: l.cle, valeur: arrondi1((100 * l.valeur) / total) }))
    .sort((a, b) => b.valeur - a.valeur);
}

const GENRES = { M: 'Hommes', F: 'Femmes', U: 'Non renseigné' };
const TRANCHES_SITE = ['18–24', '25–34', '35–44', '45–54', '55+'];

/** Regroupe les tranches d'âge de l'API dans celles du site (55-64 + 65+ = 55+). */
export function tranchesSite(ages) {
  if (!ages) return null;
  const somme = { '13–17': 0, '18–24': 0, '25–34': 0, '35–44': 0, '45–54': 0, '55+': 0 };
  for (const { cle, valeur } of ages) {
    const k = String(cle).replace('-', '–');
    if (k === '55–64' || k === '65+') somme['55+'] += valeur;
    else if (k in somme) somme[k] += valeur;
  }
  const lignes = Object.entries(somme).map(([cle, valeur]) => ({ cle, valeur }));
  const pourcentages = enPourcentages(lignes);
  if (!pourcentages) return null;
  const parCle = Object.fromEntries(pourcentages.map((l) => [l.cle, l.valeur]));
  return {
    tranches: TRANCHES_SITE.map((libelle) => ({ libelle, valeur: parCle[libelle] ?? 0 })),
    moins18: parCle['13–17'] ?? 0,
  };
}

/**
 * Assemble le bilan à partir des données brutes. Pur : testable sans réseau.
 * @param {{profil, publications, statsPublications, vuesCompte, audience, maintenant, debutAnnee}} brut
 */
export function calculerBilan({ profil, publications, statsPublications, vuesCompte, audience, maintenant, debutAnnee }) {
  const lignes = publications.map((p, i) => ({ ...p, stats: statsPublications[i] || null }));
  const vues = lignes.map((l) => l.stats?.views).filter((v) => typeof v === 'number');
  const interactions = lignes.reduce((s, l) => {
    const st = l.stats;
    if (!st) return s;
    if (typeof st.total_interactions === 'number') return s + st.total_interactions;
    return s + (st.likes || l.like_count || 0) + (st.comments || l.comments_count || 0) + (st.shares || 0) + (st.saved || 0);
  }, 0);
  const pays = enPourcentages(audience?.country);
  const villes = enPourcentages(audience?.city);
  const genre = enPourcentages(audience?.gender)?.map((g) => ({ ...g, cle: GENRES[g.cle] || g.cle }));

  return {
    source: 'api-instagram',
    releveIso: new Date(maintenant).toISOString(),
    periode: { debut: debutAnnee, fin: new Date(maintenant).toISOString().slice(0, 10) },
    compte: profil?.username || null,
    abonnes: profil?.followers_count ?? null,
    publications2026: lignes.length,
    publicationsAvecStats: vues.length,
    vuesCompte2026: vuesCompte,
    vuesPublications2026: vues.reduce((s, v) => s + v, 0),
    vuesMedianesPublication: mediane(vues),
    publicationsPlus10k: vues.filter((v) => v > 10000).length,
    publicationsPlus100k: vues.filter((v) => v > 100000).length,
    interactionsPublications2026: interactions,
    audience: {
      ages: tranchesSite(audience?.age),
      genre,
      pays: pays?.slice(0, 5) || null,
      villes: villes?.slice(0, 5) || null,
    },
  };
}

/** Synchronisation complète : lit l'API et renvoie le bilan calculé. */
export async function synchroniserInstagram({ fetchFn = fetch, jeton, idCompte, maintenant = Date.now(), debutAnnee = '2026-01-01', parallele = 6 }) {
  const cible = cibleDuJeton(jeton, idCompte);
  const profil = await lireProfil(fetchFn, jeton, cible);
  const publications = await lirePublications(fetchFn, jeton, `${debutAnnee}T00:00:00Z`, cible);
  const statsPublications = await parLots(publications, parallele, (p) => lireStatsPublication(fetchFn, jeton, p.id, cible));
  const vuesCompte = await lireVuesCompte(fetchFn, jeton, `${debutAnnee}T00:00:00Z`, maintenant, cible);
  const audience = await lireAudience(fetchFn, jeton, cible);
  return calculerBilan({ profil, publications, statsPublications, vuesCompte, audience, maintenant, debutAnnee });
}

/**
 * Prolonge un jeton longue durée (60 jours). L'API exige qu'il ait au moins
 * 24 h et soit encore valide. Renvoie { jeton, expireLe } ou lève une erreur.
 */
export async function prolongerJeton(fetchFn, jeton, maintenant = Date.now()) {
  const r = await appel(fetchFn, '/refresh_access_token', { grant_type: 'ig_refresh_token' }, jeton, { versionnee: false });
  if (!r?.access_token) throw new Error('Instagram : renouvellement du jeton sans nouveau jeton');
  return { jeton: r.access_token, expireLe: new Date(maintenant + (r.expires_in || 60 * 24 * 3600) * 1000).toISOString() };
}
