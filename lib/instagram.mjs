/* ==========================================================================
   LA GAMBERGE — STATISTIQUES INSTAGRAM (côté serveur)
   --------------------------------------------------------------------------
   Lit le compte professionnel d'Alex via l'API Graph de Meta et calcule les
   indicateurs du media kit.

   Voie unique (constat du 30 octobre 2026) : graph.facebook.com/{id du compte
   Instagram pro}, avec un jeton « EAA… » obtenu dans le Graph API Explorer
   (autorisations instagram_basic, instagram_manage_insights, pages_show_list,
   pages_read_engagement). Jeton visé : jeton de PAGE tiré d'un jeton
   utilisateur longue durée (sans date d'expiration). graph.instagram.com
   refuse ces jetons ; la « connexion Instagram » (jetons « IG… ») n'est plus
   ouverte aux nouvelles apps.
   Jamais exécuté côté navigateur : le jeton reste sur le serveur.

   Ce qui est calculé :
     - abonnés ;
     - publications de 2026 (feed + Reels ; les stories ne sont pas listées
       par l'API) et, pour elles : vues médianes, nombre à plus de 10 000 et
       de 100 000 vues, total des interactions ; les mêmes chiffres hors Reels
       d'essai listés dans REELS_ESSAI (l'API ne permet pas de les reconnaître) ;
     - vues et interactions du compte sur l'année (indicateurs « views » et
       « total_interactions » du compte, toutes surfaces, stories comprises),
       additionnées par fenêtres de 30 jours ;
     - audience des abonnés : âge (18 ans et plus), genre (hors « non
       renseigné »), pays, villes, en %, avec les effectifs bruts.
   Ce qui n'est PAS calculé : l'engagement « interactions / couverture » (la
   couverture d'une année ne s'additionne pas jour par jour) et les vues
   médianes des stories. Ils restent relevés à la main.

   Toutes les fonctions réseau reçoivent `fetch` en paramètre (testables).
   ========================================================================== */

import { REELS_ESSAI } from './instagram-reels-essai.mjs';

export const API = 'https://graph.facebook.com';
export const VERSION = 'v26.0';

/** Lit le profil ; en cas d'échec, joint un diagnostic (sans jeton) à l'erreur. */
export async function lireProfilOuDiagnostic(fetchFn, jeton, idCompte) {
  if (!idCompte) throw new Error('Instagram : INSTAGRAM_USER_ID manquant');
  try {
    const profil = await lireProfil(fetchFn, jeton, idCompte);
    if (profil && (profil.username || profil.followers_count !== undefined)) return profil;
    throw new Error('Instagram : profil vide');
  } catch (e) {
    // Diagnostic : ce que Meta accorde réellement à ce jeton.
    const diagnostic = {};
    for (const [cle, chemin, champs] of [
      ['moi', '/me', { fields: 'id,name' }],
      ['autorisations', '/me/permissions', {}],
    ]) {
      try {
        diagnostic[cle] = await appel(fetchFn, chemin, champs, jeton);
      } catch (err) {
        diagnostic[cle] = { erreur: String(err.message || err).slice(0, 160), code: err.code ?? null };
      }
    }
    e.diagnostic = diagnostic;
    throw e;
  }
}

const JOUR = 24 * 3600 * 1000;

/** Appel GET à l'API. Lève une erreur lisible (sans le jeton) en cas d'échec. */
export async function appel(fetchFn, chemin, params, jeton) {
  const url = new URL(`${API}/${VERSION}${chemin}`);
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
export function lireProfil(fetchFn, jeton, idCompte) {
  return appel(fetchFn, `/${idCompte}`, { fields: 'id,username,followers_count,media_count' }, jeton);
}

/**
 * Publications depuis `depuis` (ISO), de la plus récente à la plus ancienne.
 * L'API renvoie les publications par ordre antéchronologique : on s'arrête
 * dès qu'on passe avant la date de début.
 */
export async function lirePublications(fetchFn, jeton, depuis, idCompte) {
  const limite = new Date(depuis).getTime();
  const resultat = [];
  let page = await appel(fetchFn, `/${idCompte}/media`, {
    fields: 'id,media_type,media_product_type,timestamp,permalink,like_count,comments_count',
    limit: 100,
  }, jeton);
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
    if (!r.ok || page?.error) throw new Error(`Instagram /media (page suivante) : ${page?.error?.message || `HTTP ${r.status}`}`);
  }
  return resultat;
}

// Indicateurs demandés par publication ; si l'API en refuse un pour ce type
// de publication, on redemande avec la liste minimale.
const METRIQUES_PUBLICATION = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions'];
const METRIQUES_MINIMALES = ['views', 'reach', 'total_interactions'];

const valeurs = (reponse) => Object.fromEntries((reponse?.data || []).map((d) => [d.name, d.values?.[0]?.value ?? d.total_value?.value ?? null]));

/** Statistiques d'une publication (null si l'API n'en fournit aucune). */
export async function lireStatsPublication(fetchFn, jeton, id) {
  try {
    return valeurs(await appel(fetchFn, `/${id}/insights`, { metric: METRIQUES_PUBLICATION.join(',') }, jeton));
  } catch {
    try {
      return valeurs(await appel(fetchFn, `/${id}/insights`, { metric: METRIQUES_MINIMALES.join(',') }, jeton));
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
 * Indicateur du compte (« views », « total_interactions ») entre deux dates,
 * additionné par fenêtres de 30 jours (l'API limite chaque requête à 30 jours).
 * null si l'indicateur est refusé.
 */
export async function lireTotalCompte(fetchFn, jeton, metrique, debutIso, finMs, idCompte) {
  const fenetres = [];
  for (let debut = new Date(debutIso).getTime(); debut < finMs; debut += 30 * JOUR) fenetres.push([debut, Math.min(debut + 30 * JOUR, finMs)]);
  try {
    // Fenêtres lues en parallèle : la tâche doit tenir en 60 secondes.
    const valeurs = await Promise.all(fenetres.map(async ([debut, fin]) => {
      const r = await appel(fetchFn, `/${idCompte}/insights`, {
        metric: metrique, period: 'day', metric_type: 'total_value',
        since: Math.floor(debut / 1000), until: Math.floor(fin / 1000),
      }, jeton);
      return r?.data?.[0]?.total_value?.value;
    }));
    return valeurs.every((v) => typeof v === 'number') ? valeurs.reduce((s, v) => s + v, 0) : null;
  } catch {
    return null;
  }
}

/** Audience des abonnés, une ventilation à la fois. null si indisponible. */
export async function lireAudience(fetchFn, jeton, idCompte) {
  const ventilations = ['age', 'gender', 'country', 'city'];
  const resultats = await Promise.all(ventilations.map(async (ventilation) => {
    try {
      const r = await appel(fetchFn, `/${idCompte}/insights`, {
        metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', breakdown: ventilation,
      }, jeton);
      return (r?.data?.[0]?.total_value?.breakdowns?.[0]?.results || []).map((x) => ({ cle: x.dimension_values?.[0], valeur: x.value }));
    } catch {
      return null;
    }
  }));
  return Object.fromEntries(ventilations.map((v, i) => [v, resultats[i]]));
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

const GENRES = { M: 'Hommes', F: 'Femmes' };
const TRANCHES_SITE = ['18–24', '25–34', '35–44', '45–54', '55+'];
const somme = (lignes) => (lignes || []).reduce((s, l) => s + (l.valeur || 0), 0);

/**
 * Genre des abonnés, même définition que le relevé manuel : « non renseigné »
 * (U) exclu du calcul. Sa part sur l'ensemble est gardée à côté.
 */
export function genreSite(genres) {
  if (!genres) return null;
  const connus = genres.filter((g) => g.cle in GENRES);
  const repartition = enPourcentages(connus)?.map((g) => ({ ...g, cle: GENRES[g.cle] }));
  if (!repartition) return null;
  const total = somme(genres);
  return { repartition, nonRenseigne: total ? arrondi1((100 * (total - somme(connus))) / total) : 0 };
}

/**
 * Tranches d'âge du site (55-64 + 65+ = 55+), en % des abonnés de 18 ans et
 * plus (même définition que le relevé manuel). La part des 13–17 ans sur
 * l'ensemble est gardée à côté.
 */
export function tranchesSite(ages) {
  if (!ages) return null;
  const parTranche = { '13–17': 0, '18–24': 0, '25–34': 0, '35–44': 0, '45–54': 0, '55+': 0 };
  for (const { cle, valeur } of ages) {
    const k = String(cle).replace('-', '–');
    if (k === '55–64' || k === '65+') parTranche['55+'] += valeur;
    else if (k in parTranche) parTranche[k] += valeur;
  }
  const majeurs = TRANCHES_SITE.map((cle) => ({ cle, valeur: parTranche[cle] }));
  const pourcentages = enPourcentages(majeurs);
  if (!pourcentages) return null;
  const parCle = Object.fromEntries(pourcentages.map((l) => [l.cle, l.valeur]));
  const total = somme(majeurs) + parTranche['13–17'];
  return {
    tranches: TRANCHES_SITE.map((libelle) => ({ libelle, valeur: parCle[libelle] ?? 0 })),
    moins18: total ? arrondi1((100 * parTranche['13–17']) / total) : 0,
  };
}

/**
 * Pays ou villes : deux bases de calcul, gardées côte à côte tant que la bonne
 * n'est pas confirmée (écart constaté : France 88 % ici, 78,2 % dans l'app).
 *   - `surRenvoyes` : % de la somme des lignes renvoyées par Meta (ancienne
 *     définition ; Meta ne renvoie probablement que les premiers pays) ;
 *   - `surAbonnes`  : % du nombre total d'abonnés (hypothèse à vérifier).
 */
export function lieuxSite(lignes, abonnes) {
  const surRenvoyes = enPourcentages(lignes)?.slice(0, 5) || null;
  const surAbonnes = lignes?.length && abonnes
    ? [...lignes].sort((a, b) => b.valeur - a.valeur).slice(0, 5).map((l) => ({ cle: l.cle, valeur: arrondi1((100 * l.valeur) / abonnes) }))
    : null;
  return { surRenvoyes, surAbonnes, lignesRenvoyees: lignes?.length ?? 0, totalRenvoye: lignes ? somme(lignes) : null };
}

/** Code court d'une publication (…/p/CODE/ ou …/reel/CODE/). */
export const codeCourt = (permalink) => String(permalink || '').match(/\/(?:p|reel|reels|tv)\/([^/?#]+)/)?.[1] || null;

/** Indicateurs de vues d'un ensemble de publications. */
function indicateursVues(lignes) {
  const vues = lignes.map((l) => l.stats?.views).filter((v) => typeof v === 'number');
  return {
    publications: lignes.length,
    avecStats: vues.length,
    total: vues.reduce((s, v) => s + v, 0),
    mediane: mediane(vues),
    plus10k: vues.filter((v) => v > 10000).length,
    plus100k: vues.filter((v) => v > 100000).length,
  };
}

/**
 * Assemble le bilan à partir des données brutes. Pur : testable sans réseau.
 * @param {{profil, publications, statsPublications, vuesCompte, interactionsCompte, audience, maintenant, debutAnnee, reelsEssai}} brut
 */
export function calculerBilan({ profil, publications, statsPublications, vuesCompte, interactionsCompte = null, audience, maintenant, debutAnnee, reelsEssai = REELS_ESSAI }) {
  const lignes = publications.map((p, i) => ({ ...p, stats: statsPublications[i] || null }));
  const essais = new Set(reelsEssai);
  const tous = indicateursVues(lignes);
  const horsEssai = indicateursVues(lignes.filter((l) => !essais.has(codeCourt(l.permalink))));
  const interactions = lignes.reduce((s, l) => {
    const st = l.stats;
    if (!st) return s;
    if (typeof st.total_interactions === 'number') return s + st.total_interactions;
    return s + (st.likes || l.like_count || 0) + (st.comments || l.comments_count || 0) + (st.shares || 0) + (st.saved || 0);
  }, 0);
  const abonnes = profil?.followers_count ?? null;
  const genre = genreSite(audience?.gender);
  const pays = lieuxSite(audience?.country, abonnes);
  const villes = lieuxSite(audience?.city, abonnes);

  return {
    source: 'api-instagram',
    releveIso: new Date(maintenant).toISOString(),
    periode: { debut: debutAnnee, fin: new Date(maintenant).toISOString().slice(0, 10) },
    compte: profil?.username || null,
    abonnes,
    publications2026: tous.publications,
    publicationsAvecStats: tous.avecStats,
    vuesCompte2026: vuesCompte,
    vuesPublications2026: tous.total,
    vuesMedianesPublication: tous.mediane,
    publicationsPlus10k: tous.plus10k,
    publicationsPlus100k: tous.plus100k,
    // Mêmes indicateurs, Reels d'essai (REELS_ESSAI) exclus.
    horsReelsEssai: { exclues: tous.publications - horsEssai.publications, ...horsEssai },
    interactionsPublications2026: interactions,
    interactionsCompte2026: interactionsCompte,
    audience: {
      ages: tranchesSite(audience?.age),
      genre: genre?.repartition || null,
      genreNonRenseigne: genre?.nonRenseigne ?? null,
      pays: pays.surRenvoyes,
      paysSurAbonnes: pays.surAbonnes,
      villes: villes.surRenvoyes,
      villesSurAbonnes: villes.surAbonnes,
      // Effectifs bruts (sans les pourcentages) pour vérifier les définitions.
      bases: {
        abonnes,
        genre: audience?.gender ? somme(audience.gender) : null,
        ages: audience?.age ? somme(audience.age) : null,
        pays: { lignes: pays.lignesRenvoyees, total: pays.totalRenvoye },
        villes: { lignes: villes.lignesRenvoyees, total: villes.totalRenvoye },
      },
    },
  };
}

/** Synchronisation complète : lit l'API et renvoie le bilan calculé. */
export async function synchroniserInstagram({ fetchFn = fetch, jeton, idCompte, maintenant = Date.now(), debutAnnee = '2026-01-01', parallele = 10 }) {
  const debut = `${debutAnnee}T00:00:00Z`;
  const profil = await lireProfilOuDiagnostic(fetchFn, jeton, idCompte);
  let publications = [];
  // Lectures indépendantes menées en parallèle (la tâche doit tenir en 60 s).
  const [statsPublications, vuesCompte, interactionsCompte, audience] = await Promise.all([
    lirePublications(fetchFn, jeton, debut, idCompte).then((pubs) => { publications = pubs; return parLots(pubs, parallele, (p) => lireStatsPublication(fetchFn, jeton, p.id)); }),
    lireTotalCompte(fetchFn, jeton, 'views', debut, maintenant, idCompte),
    lireTotalCompte(fetchFn, jeton, 'total_interactions', debut, maintenant, idCompte),
    lireAudience(fetchFn, jeton, idCompte),
  ]);
  return calculerBilan({ profil, publications, statsPublications, vuesCompte, interactionsCompte, audience, maintenant, debutAnnee });
}

// -- Jeton : durée de vie et alerte -------------------------------------------

/** Nombre de jours avant l'alerte d'expiration du jeton. */
export const ALERTE_JOURS = 21;

/**
 * Informations Meta sur le jeton (debug_token), sans le jeton lui-même.
 * L'appel exige un jeton d'app (`ID_APP|SECRET_APP`) ou un jeton utilisateur
 * d'un développeur de l'app ; sans jeton d'app, on essaie avec le jeton
 * lui-même (refusé pour un jeton de Page, d'où INSTAGRAM_APP_ID/SECRET).
 * Renvoie null si Meta refuse : la vérification ne bloque jamais le relevé.
 */
export async function verifierJeton(fetchFn, jeton, jetonApp = null) {
  try {
    const d = (await appel(fetchFn, '/debug_token', { input_token: jeton }, jetonApp || jeton))?.data;
    if (!d) return null;
    const date = (s) => (s ? new Date(s * 1000).toISOString() : null); // 0 = jamais
    return {
      type: d.type || null, // USER, PAGE, SYSTEM_USER…
      valide: Boolean(d.is_valid),
      expireLe: date(d.expires_at),
      accesDonneesExpireLe: date(d.data_access_expires_at),
      autorisations: d.scopes || null,
    };
  } catch {
    return null;
  }
}

/**
 * État du jeton pour le compte rendu (pur) : jours restants avant la
 * première échéance (expiration ou fin d'accès aux données) et alerte.
 */
export function etatJeton(info, maintenant = Date.now()) {
  if (!info) return { connu: false, alerte: false };
  const echeances = [info.expireLe, info.accesDonneesExpireLe].filter(Boolean).map((s) => new Date(s).getTime());
  const prochaine = echeances.length ? Math.min(...echeances) : null;
  const joursRestants = prochaine === null ? null : Math.floor((prochaine - maintenant) / JOUR);
  return {
    connu: true,
    type: info.type,
    valide: info.valide,
    expireLe: info.expireLe,
    accesDonneesExpireLe: info.accesDonneesExpireLe,
    joursRestants,
    alerte: !info.valide || (joursRestants !== null && joursRestants < ALERTE_JOURS),
  };
}
