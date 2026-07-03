// Fonction serverless Vercel : GET /api/streak
// Renvoie l'état de la streak calculé en direct depuis Strava.
// Si Strava n'est pas configuré (variables d'env absentes), renvoie
// { configured: false } → le site retombe sur la valeur manuelle du fichier
// src/data/site.js. Ne plante jamais la page.

import { getStreakFromStrava } from '../lib/strava.mjs';

export default async function handler(req, res) {
  try {
    const data = await getStreakFromStrava(process.env);
    // Cache CDN 5 min (évite de solliciter Strava à chaque visite) avec
    // rafraîchissement en arrière-plan.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (err) {
    res.status(200).json({ configured: false, error: 'strava_unavailable' });
  }
}
