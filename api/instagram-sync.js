// Fonction serverless Vercel : GET /api/instagram-sync
// Lancée chaque jour par la tâche planifiée Vercel (vercel.json → crons).
//
// 1. Refuse tout appel sans le secret de la tâche planifiée (CRON_SECRET) :
//    l'URL n'est pas un point d'accès public.
// 2. Lit la base lagamberge-db à chaque passage : cette activité quotidienne
//    évite aussi la mise en pause automatique du projet Supabase gratuit.
// 3. Renouvelle le jeton Instagram (valable 60 jours) tous les 7 jours.
// 4. Calcule le bilan (lib/instagram.mjs) et l'enregistre (snapshot + historique).
// 5. Si INSTAGRAM_DEPLOY_HOOK est défini, relance la construction du site pour
//    qu'il affiche les nouveaux chiffres.
// Le jeton n'apparaît jamais dans une réponse ni dans un journal.

import { synchroniserInstagram, prolongerJeton } from '../lib/instagram.mjs';
import { lireJeton, ecrireJeton, lireSnapshotInstagram, ecrireBilan } from '../lib/instagram-store.mjs';

const RENOUVELLEMENT_MS = 7 * 24 * 3600 * 1000;

export function creerHandler({ env, fetchFn = fetch, maintenant = () => Date.now(), synchroniser = synchroniserInstagram, prolonger = prolongerJeton, store = { lireJeton, ecrireJeton, lireSnapshotInstagram, ecrireBilan } }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const secret = env.CRON_SECRET;
    if (!secret || req.headers?.authorization !== `Bearer ${secret}`) {
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
      res.status(200).json({ ok: true, configured: false, base: precedent ? 'lue' : 'vide' });
      return;
    }

    // Renouvellement : tous les 7 jours (l'API exige un jeton d'au moins 24 h).
    let renouvellement = 'inutile';
    const dernier = courant.renouveleLe ? new Date(courant.renouveleLe).getTime() : 0;
    if (t - dernier > RENOUVELLEMENT_MS) {
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
      bilan = await synchroniser({ fetchFn, jeton: courant.jeton, maintenant: t });
    } catch (e) {
      res.status(200).json({ ok: false, configured: true, renouvellement, error: String(e.message || e).replace(courant.jeton, '***') });
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
