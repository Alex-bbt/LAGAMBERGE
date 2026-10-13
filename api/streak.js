// Fonction serverless Vercel : GET /api/streak
// Renvoie le bilan du défi, calculé depuis Strava.
//
// Stratégie « dernier bilan connu, puis actualisation en arrière-plan »
// (voir lib/snapshot.mjs, cache persistant Supabase, partagé par tous les
// visiteurs) :
//   1. Un snapshot existe → on le renvoie IMMÉDIATEMENT, quel que soit son
//      âge. Sa date de calcul (`updatedAt`) reste celle de la dernière
//      synchronisation réelle : jamais présentée comme une nouvelle sync.
//   2. S'il a plus de 10 minutes, on relance Strava EN ARRIÈRE-PLAN
//      (waitUntil) ; le visiteur suivant reçoit le bilan actualisé.
//   3. Aucun snapshot (premier appel) → calcul Strava direct, puis écriture.
//   4. Strava en échec → on conserve le dernier snapshot, rien n'est effacé.
// Les identifiants Strava ne quittent jamais le serveur.
// Ne plante jamais la page.

import { waitUntil } from '@vercel/functions';
import { getStreakFromStrava } from '../lib/strava.mjs';
import { readSnapshot, writeSnapshot } from '../lib/snapshot.mjs';

// Au-delà de cet âge, le snapshot est encore servi mais une actualisation
// Strava est lancée en arrière-plan.
const FRESH_TTL_MS = 10 * 60 * 1000; // 10 minutes

// CDN : 5 min de cache, puis le dernier bilan reste servi pendant que le CDN
// revalide en arrière-plan.
const CACHE_OK = 'public, s-maxage=300, stale-while-revalidate=86400';

// Logique testable : les dépendances (lecture/écriture du cache, Strava,
// waitUntil) sont injectées. Voir l'export par défaut pour le branchement réel.
export function creerHandler({ lire, ecrire, strava, enArrierePlan, env, maintenant = () => Date.now() }) {
  // Synchronise Strava et persiste le résultat. Ne lève jamais.
  async function synchroniser() {
    try {
      const data = await strava(env);
      if (data && data.configured) await ecrire(env, data);
      return data || null;
    } catch {
      return null;
    }
  }

  return async function handler(req, res) {
    const snap = await lire(env);

    // 1-2) Dernier bilan connu : réponse immédiate, actualisation si besoin.
    if (snap && snap.data && snap.data.configured !== false) {
      const age = maintenant() - new Date(snap.updatedAt).getTime();
      const aActualiser = !(age < FRESH_TTL_MS);
      if (aActualiser) {
        const tache = synchroniser();
        try { enArrierePlan(tache); } catch { /* hors Vercel : la promesse continue seule */ }
      }
      res.setHeader('Cache-Control', CACHE_OK);
      res.status(200).json({ ...snap.data, configured: true, cached: true, refreshing: aActualiser });
      return;
    }

    // 3) Pas encore de snapshot : calcul direct.
    const data = await synchroniser();
    if (data && data.configured) {
      res.setHeader('Cache-Control', CACHE_OK);
      res.status(200).json(data);
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data && data.configured === false ? data : { configured: false, error: 'strava_unavailable' });
  };
}

export default function handler(req, res) {
  return creerHandler({
    lire: readSnapshot,
    ecrire: writeSnapshot,
    strava: getStreakFromStrava,
    enArrierePlan: waitUntil,
    env: process.env,
  })(req, res);
}
