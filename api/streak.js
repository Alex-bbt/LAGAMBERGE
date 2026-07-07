// Fonction serverless Vercel : GET /api/streak
// Renvoie l'état de la streak, calculé en direct depuis Strava.
//
// Stratégie "dernière valeur connue" (voir lib/snapshot.mjs) :
//   1. Si un snapshot récent existe en base → on le sert IMMÉDIATEMENT
//      (rapide, pas d'aller-retour Strava) : l'utilisateur voit tout de suite
//      la vraie dernière valeur validée, jamais un chiffre vieux de plusieurs
//      jours.
//   2. Sinon → on interroge Strava, on PERSISTE le résultat (nouveau snapshot)
//      puis on le renvoie.
//   3. Si Strava échoue → on sert le dernier snapshot connu (même un peu vieux)
//      plutôt que rien. En tout dernier recours seulement : { configured:false }
//      → le site retombe sur la valeur manuelle de src/data/site.js.
//
// Ne plante jamais la page.

import { getStreakFromStrava } from '../lib/strava.mjs';
import { readSnapshot, writeSnapshot } from '../lib/snapshot.mjs';

// En-dessous de cet âge, un snapshot est jugé assez frais pour être servi tel
// quel sans redemander à Strava (le CDN met déjà en cache 5 min par-dessus).
const FRESH_TTL_MS = 10 * 60 * 1000; // 10 minutes

const CACHE_OK = 'public, s-maxage=300, stale-while-revalidate=86400';

export default async function handler(req, res) {
  // 1) Snapshot récent → réponse instantanée, toujours à jour de la dernière
  //    journée validée connue.
  const snap = await readSnapshot(process.env);
  if (snap && Date.now() - new Date(snap.updatedAt).getTime() < FRESH_TTL_MS) {
    res.setHeader('Cache-Control', CACHE_OK);
    res.status(200).json({ ...snap.data, configured: true, cached: true });
    return;
  }

  // 2) Pas de snapshot frais → on recalcule depuis Strava.
  try {
    const data = await getStreakFromStrava(process.env);
    if (data && data.configured) {
      // On persiste la dernière valeur validée : elle deviendra la valeur par
      // défaut fraîche au prochain chargement (attente Strava quasi nulle).
      await writeSnapshot(process.env, data);
      res.setHeader('Cache-Control', CACHE_OK);
      res.status(200).json(data);
      return;
    }
    // Strava non configuré : si on a malgré tout un vieux snapshot, on le sert.
    if (snap) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ ...snap.data, configured: true, cached: true, stale: true });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (err) {
    // 3) Strava indisponible : on sert la dernière valeur connue si on en a une.
    if (snap) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ ...snap.data, configured: true, cached: true, stale: true });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, error: 'strava_unavailable' });
  }
}
