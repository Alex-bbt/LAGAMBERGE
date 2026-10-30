// Fonction serverless Vercel : GET /api/instagram-sync
// Lancée chaque jour par la tâche planifiée Vercel (vercel.json → crons).
//
// 1. Refuse tout appel sans le secret de la tâche planifiée (CRON_SECRET) :
//    l'URL n'est pas un point d'accès public.
// 2. Lit la base lagamberge-db à chaque passage : cette activité quotidienne
//    évite aussi la mise en pause automatique du projet Supabase gratuit.
// 3. Renouvelle le jeton tous les 7 jours s'il expire (jeton « connexion
//    Instagram », 60 jours) ; le jeton d'utilisateur système de la connexion
//    unifiée n'expire pas et n'est jamais renouvelé.
// 4. Calcule le bilan (lib/instagram.mjs) et l'enregistre (snapshot + historique).
// 5. Si INSTAGRAM_DEPLOY_HOOK est défini, relance la construction du site pour
//    qu'il affiche les nouveaux chiffres.
// Le jeton n'apparaît jamais dans une réponse ni dans un journal.

import { synchroniserInstagram, prolongerJeton, cibleDuJeton } from '../lib/instagram.mjs';
import { lireJeton, ecrireJeton, lireSnapshotInstagram, ecrireBilan } from '../lib/instagram-store.mjs';

const RENOUVELLEMENT_MS = 7 * 24 * 3600 * 1000;

// Compte rendu dans les journaux Vercel (jamais le jeton) : seul moyen de
// savoir, a posteriori, ce qu'a donné un passage de la tâche planifiée.
const journal = (etat, details = {}) => console.log(JSON.stringify({ tache: 'instagram-sync', etat, ...details }));

export function creerHandler({ env, fetchFn = fetch, maintenant = () => Date.now(), synchroniser = synchroniserInstagram, prolonger = prolongerJeton, store = { lireJeton, ecrireJeton, lireSnapshotInstagram, ecrireBilan } }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const secret = env.CRON_SECRET;
    if (!secret || req.headers?.authorization !== `Bearer ${secret}`) {
      journal('refus', { secretConfigure: Boolean(secret), entete: Boolean(req.headers?.authorization) });
      res.status(401).json({ ok: false, error: 'non_autorise' });
      return;
    }

    // Activité quotidienne sur la base (et état précédent pour le compte rendu).
    const precedent = await store.lireSnapshotInstagram(env, fetchFn);

    const enregistre = await store.lireJeton(env, fetchFn);
    const t = maintenant();
    const enregistreValide = enregistre?.jeton && (!enregistre.expireLe || new Date(enregistre.expireLe).getTime() > t);
    let courant = enregistreValide ? enregistre : env.INSTAGRAM_ACCESS_TOKEN ? { jeton: env.INSTAGRAM_ACCESS_TOKEN, expireLe: null, renouveleLe: null } : null;
    if (!courant) {
      journal('sans_jeton', { base: precedent ? 'lue' : 'vide' });
      res.status(200).json({ ok: true, configured: false, base: precedent ? 'lue' : 'vide' });
      return;
    }

    // Renouvellement : tous les 7 jours (l'API exige un jeton d'au moins 24 h),
    // seulement pour les jetons qui expirent.
    let renouvellement = 'inutile';
    let renouvelable = false;
    try { renouvelable = cibleDuJeton(courant.jeton, env.INSTAGRAM_USER_ID).renouvelable; } catch { /* signalé par la synchronisation */ }
    const dernier = courant.renouveleLe ? new Date(courant.renouveleLe).getTime() : 0;
    if (renouvelable && t - dernier > RENOUVELLEMENT_MS) {
      try {
        const nouveau = await prolonger(fetchFn, courant.jeton, t);
        courant = { ...nouveau, renouveleLe: new Date(t).toISOString() };
        renouvellement = (await store.ecrireJeton(env, courant, fetchFn)) ? 'fait' : 'fait_non_enregistre';
      } catch {
        renouvellement = 'echec'; // ex. jeton de moins de 24 h : nouvel essai demain
        if (!enregistre) await store.ecrireJeton(env, courant, fetchFn);
      }
    }

    let bilan;
    try {
      bilan = await synchroniser({ fetchFn, jeton: courant.jeton, idCompte: env.INSTAGRAM_USER_ID, maintenant: t });
    } catch (e) {
      const erreur = String(e.message || e).replace(courant.jeton, '***');
      journal('echec_meta', { renouvellement, erreur, code: e.code ?? null, statut: e.statut ?? null, compteConfigure: Boolean(env.INSTAGRAM_USER_ID) });
      res.status(200).json({ ok: false, configured: true, renouvellement, error: erreur });
      return;
    }
    const ecrit = await store.ecrireBilan(env, bilan, fetchFn);

    let construction = 'non_configuree';
    if (env.INSTAGRAM_DEPLOY_HOOK && ecrit) {
      try {
        const r = await fetchFn(env.INSTAGRAM_DEPLOY_HOOK, { method: 'POST' });
        construction = r.ok ? 'relancee' : 'echec';
      } catch {
        construction = 'echec';
      }
    }

    journal(ecrit ? 'releve_enregistre' : 'releve_non_enregistre', {
      renouvellement, construction, abonnes: bilan.abonnes,
      publications2026: bilan.publications2026, publicationsAvecStats: bilan.publicationsAvecStats,
      vuesCompte: bilan.vuesCompte2026 !== null, audience: Boolean(bilan.audience?.genre),
    });
    res.status(200).json({
      ok: ecrit,
      configured: true,
      renouvellement,
      construction,
      releve: bilan.releveIso,
      abonnes: bilan.abonnes,
      publications2026: bilan.publications2026,
      publicationsAvecStats: bilan.publicationsAvecStats,
    });
  };
}

export default function handler(req, res) {
  return creerHandler({ env: process.env })(req, res);
}
