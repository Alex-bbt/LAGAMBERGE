// Fonction serverless Vercel : GET /api/streak
// Renvoie l'état de la streak calculé en direct depuis Strava.
// Si Strava n'est pas configuré (variables d'env absentes), renvoie
// { configured: false } → le site retombe sur la valeur manuelle du fichier
// src/data/site.js. Ne plante jamais la page.

import { getStreakFromStrava } from '../lib/strava.mjs';

export default async function handler(req, res) {
  try {
    const data = await getStreakFromStrava(process.env);
    if (data && data.configured) {
      // On ne met en cache QUE les réponses réussies (5 min). Ainsi un échec
      // temporaire de Strava (rate limit…) n'est jamais figé côté CDN.
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, error: 'strava_unavailable' });
  }
}
