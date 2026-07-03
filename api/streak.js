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
      // On ne met en cache QUE les réponses réussies. `stale-while-revalidate`
      // long = le CDN sert instantanément la dernière bonne réponse (même un
      // peu périmée) et rafraîchit en arrière-plan → l'utilisateur n'attend
      // quasiment jamais Strava et ne voit plus les valeurs de secours.
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, error: 'strava_unavailable' });
  }
}
